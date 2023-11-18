import { uniqueId } from "lodash";
import { useContext, useEffect, useRef, useState } from "react";
import PaginatorComponent from "../../components/PaginatorComponent";
import ShadTooltip from "../../components/ShadTooltipComponent";
import CollectionCardComponent from "../../components/cardComponent";
import IconComponent from "../../components/genericIconComponent";
import PageLayout from "../../components/pageLayout";
import { SkeletonCardComponent } from "../../components/skeletonCardComponent";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { alertContext } from "../../contexts/alertContext";
import { AuthContext } from "../../contexts/authContext";
import { StoreContext } from "../../contexts/storeContext";
import { getStoreComponents, getStoreTags } from "../../controllers/API";
import { storeComponent } from "../../types/store";
import { cn } from "../../utils/utils";
export default function StorePage(): JSX.Element {
  const { validApiKey, setValidApiKey, hasApiKey, loadingApiKey } =
    useContext(StoreContext);
  const { apiKey } = useContext(AuthContext);
  const { setErrorData } = useContext(alertContext);
  const [loading, setLoading] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);
  const [filteredCategories, setFilterCategories] = useState<any[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [searchData, setSearchData] = useState<storeComponent[]>([]);
  const [totalRowsCount, setTotalRowsCount] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageOrder, setPageOrder] = useState("Popular");
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [tabActive, setTabActive] = useState("All");
  const [searchNow, setSearchNow] = useState("");
  const [selectFilter, setSelectFilter] = useState("all");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fadeContainerRef = useRef<HTMLDivElement>(null);
  const [divWidth, setDivWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current) {
        setDivWidth(scrollContainerRef.current.clientWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // call the function at start to get the initial width
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || !fadeContainerRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      const atStart = scrollLeft === 0;
      const atEnd = scrollLeft === scrollWidth - clientWidth;
      const isScrollable = scrollWidth > clientWidth;

      fadeContainerRef.current.classList.toggle(
        "fade-left",
        isScrollable && !atStart
      );
      fadeContainerRef.current.classList.toggle(
        "fade-right",
        isScrollable && !atEnd
      );
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      // Delay the initial scroll event dispatch to ensure correct calculation
      scrollContainer.dispatchEvent(new Event("scroll"));
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [divWidth, loadingTags]); // Depend on divWidth

  useEffect(() => {
    handleGetTags();
  }, []);

  useEffect(() => {
    if (!loadingApiKey) {
      if (!hasApiKey) {
        setErrorData({
          title: "API Key Error",
          list: [
            "You don't have an API Key. Please add one to use the Langflow Store.",
          ],
        });
      } else if (!validApiKey) {
        setErrorData({
          title: "API Key Error",
          list: [
            "Your API Key is not valid. Please add a valid API Key to use the Langflow Store.",
          ],
        });
      }
    }
  }, [loadingApiKey, validApiKey, hasApiKey]);

  useEffect(() => {
    handleGetComponents();
  }, [
    tabActive,
    pageOrder,
    pageIndex,
    pageSize,
    filteredCategories,
    selectFilter,
    validApiKey,
    hasApiKey,
    apiKey,
    searchNow,
    loadingApiKey,
  ]);

  function handleGetTags() {
    setLoadingTags(true);
    getStoreTags().then((res) => {
      setTags(res);
      setLoadingTags(false);
    });
  }

  function handleGetComponents() {
    if (!hasApiKey || loadingApiKey) return;
    setLoading(true);
    getStoreComponents({
      page: pageIndex,
      limit: pageSize,
      is_component:
        tabActive === "All" ? null : tabActive === "Flows" ? false : true,
      sort: pageOrder === "Popular" ? "-count(downloads)" : "name",
      tags: filteredCategories,
      liked: selectFilter === "likedbyme" && validApiKey ? true : null,
      status: null,
      search: inputText === "" ? null : inputText,
      filterByUser: selectFilter === "createdbyme" && validApiKey ? true : null,
    })
      .then((res) => {
        if (!res?.authorized && validApiKey === true) {
          setValidApiKey(false);
          setSelectFilter("all");
        } else {
          if (res?.authorized) {
            setValidApiKey(true);
          }
          setLoading(false);
          setSearchData(res?.results ?? []);
          setTotalRowsCount(
            filteredCategories?.length === 0
              ? Number(res?.count ?? 0)
              : res?.results?.length ?? 0
          );
        }
      })
      .catch((err) => {
        if (err.response.status === 403 || err.response.status === 401) {
          setValidApiKey(false);
        } else {
          setSearchData([]);
          setTotalRowsCount(0);
          setLoading(false);
          setErrorData({
            title: "Error getting components.",
            list: [err["response"]["data"]["detail"]],
          });
        }
      });
  }

  const updateTags = (tagName: string) => {
    setFilterCategories((prevArray) => {
      const index = prevArray.indexOf(tagName);
      if (index === -1) {
        // Item does not exist in array, add it
        return [...prevArray, tagName];
      } else {
        // Item exists in array, remove it
        return prevArray.filter((_, i) => i !== index);
      }
    });
  };

  return (
    <PageLayout
      title="Langflow Store"
      description="Search flows and components from the community."
      /*       button={{StoreApiKeyModal && (
        <StoreApiKeyModal disabled={loading}>
          <Button
            disabled={loading}
            className={cn(
              `${!validApiKey ? "animate-pulse border-error" : ""}`,
              loading ? "cursor-not-allowed" : ""
            )}
            variant="primary"
          >
            <IconComponent name="Key" className="mr-2 w-4" />
            API Key
          </Button>
        </StoreApiKeyModal>
      )}} */
    >
      <div className="flex h-full w-full flex-col justify-between">
        <div className="flex w-full flex-col gap-4 p-0">
          <div className="flex items-end gap-4">
            <div className="relative h-12 w-[40%]">
              <Input
                disabled={loading}
                placeholder="Search Flows and Components"
                className="absolute h-12 pl-5 pr-12"
                onChange={(e) => {
                  setInputText(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchNow(uniqueId());
                  }
                }}
                value={inputText}
              />
              <button
                disabled={loading}
                className="absolute bottom-0 right-4 top-0 my-auto h-6 cursor-pointer stroke-1 text-muted-foreground"
                onClick={() => {
                  setSearchNow(uniqueId());
                }}
              >
                <IconComponent
                  name={loading ? "Loader2" : "Search"}
                  className={loading ? " animate-spin cursor-not-allowed" : ""}
                />
              </button>
            </div>
            <div className="ml-4 flex w-full gap-2 border-b border-border">
              <button
                disabled={loading}
                onClick={() => {
                  setTabActive("All");
                }}
                className={
                  (tabActive === "All"
                    ? "border-b-2 border-primary p-3"
                    : " border-b-2 border-transparent p-3 text-muted-foreground hover:text-primary") +
                  (loading ? " cursor-not-allowed " : "")
                }
              >
                All
              </button>
              <button
                disabled={loading}
                onClick={() => {
                  setTabActive("Flows");
                }}
                className={
                  (tabActive === "Flows"
                    ? "border-b-2 border-primary p-3"
                    : " border-b-2 border-transparent p-3 text-muted-foreground hover:text-primary") +
                  (loading ? " cursor-not-allowed " : "")
                }
              >
                Flows
              </button>
              <button
                disabled={loading}
                onClick={() => {
                  setTabActive("Components");
                }}
                className={
                  (tabActive === "Components"
                    ? "border-b-2 border-primary p-3"
                    : " border-b-2 border-transparent p-3 text-muted-foreground hover:text-primary") +
                  (loading ? " cursor-not-allowed " : "")
                }
              >
                Components
              </button>
              <ShadTooltip content="Coming Soon">
                <button className="cursor-not-allowed p-3 text-muted-foreground">
                  Bundles
                </button>
              </ShadTooltip>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              disabled={loading}
              onValueChange={setSelectFilter}
              value={selectFilter}
            >
              <SelectTrigger className="mr-4 w-[160px] flex-shrink-0">
                <SelectValue placeholder="Filter Values" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="createdbyme">Created By Me</SelectItem>
                  <SelectItem value="likedbyme">Liked By Me</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div ref={fadeContainerRef} className="fade-container">
              <div
                ref={scrollContainerRef}
                className="scroll-container flex gap-2"
              >
                {!loadingTags &&
                  tags.map((tag, idx) => (
                    <button
                      disabled={loading}
                      className={loading ? "cursor-not-allowed" : ""}
                      onClick={() => {
                        updateTags(tag.name);
                      }}
                    >
                      <Badge
                        key={idx}
                        variant="outline"
                        size="sq"
                        className={cn(
                          filteredCategories.some(
                            (category) => category === tag.name
                          )
                            ? "bg-beta-foreground text-background hover:bg-beta-foreground"
                            : ""
                        )}
                      >
                        {tag.name}
                      </Badge>
                    </button>
                  ))}
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="px-0.5 text-sm text-muted-foreground">
              {(!loading || searchData.length !== 0) && (
                <>
                  {totalRowsCount} {totalRowsCount !== 1 ? "results" : "result"}
                </>
              )}
            </span>

            <Select
              disabled={loading}
              onValueChange={(e) => {
                setPageOrder(e);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Popular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Popular">Popular</SelectItem>
                {/* <SelectItem value="Recent">Most Recent</SelectItem> */}
                <SelectItem value="Alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
            {!loading || searchData.length !== 0 ? (
              searchData.map((item) => {
                return (
                  <>
                    <CollectionCardComponent
                      key={item.id}
                      data={item}
                      authorized={validApiKey}
                      disabled={loading}
                    />
                  </>
                );
              })
            ) : (
              <>
                <SkeletonCardComponent />
                <SkeletonCardComponent />
                <SkeletonCardComponent />
              </>
            )}
          </div>

          {!loading && searchData?.length === 0 && (
            <div className="mt-6 flex w-full items-center justify-center text-center">
              <div className="flex h-full w-full flex-col">
                <div className="flex w-full flex-col gap-4">
                  <div className="grid w-full gap-4">
                    You haven't{" "}
                    {selectFilter === "createdbyme" ? "created" : "liked"}{" "}
                    anything yet.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {!loading && searchData.length > 0 && (
          <div className="relative py-6">
            <PaginatorComponent
              storeComponent={true}
              pageIndex={pageIndex}
              pageSize={pageSize}
              totalRowsCount={totalRowsCount}
              paginate={(pageSize, pageIndex) => {
                setPageIndex(pageIndex);
                setPageSize(pageSize);
              }}
            ></PaginatorComponent>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
