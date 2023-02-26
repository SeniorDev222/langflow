import { Disclosure } from "@headlessui/react";
import { ArrowUpTrayIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { classNames } from "../../utils";
import { locationContext } from "../../contexts/locationContext";
import { TabsContext } from "../../contexts/tabsContext";

export default function ExtraSidebar() {
  const {uploadFlow} = useContext(TabsContext)
  const {
    atual,
    isStackedOpen,
    setIsStackedOpen,
    extraNavigation,
    extraComponent,
  } = useContext(locationContext);
  return (
    <>
      <aside
        className={` ${
          isStackedOpen ? "w-60" : "w-0 "
        } flex-shrink-0 flex overflow-hidden flex-col border-r transition-all duration-500`}
      >
        <div className="w-60 overflow-y-auto scrollbar-hide h-full flex flex-col items-start">
          <div className="flex pt-4 px-4 justify-between align-middle w-full">
            <span className="text-gray-900 text-lg ml-2 font-semibold">
              {extraNavigation.title}
            </span>
            <button
              className="text-gray-400 flex-shrink-0 inline-flex items-center justify-center rounded-lg"
              onClick={() => setIsStackedOpen(false)}
            >
              <ChevronLeftIcon className="h-6 w-6"></ChevronLeftIcon>
            </button>
          </div>
          <div className="flex flex-grow flex-col w-full">
            {extraNavigation.options ? (
              <div className="p-4">
                <nav className="flex-1 space-y-1">
                  {extraNavigation.options.map((item) =>
                    !item.children ? (
                      <div key={item.name}>
                        <Link
                          to={item.href}
                          className={classNames(
                            item.href.split("/")[2] === atual[4]
                              ? "bg-gray-100 text-gray-900"
                              : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                            "group w-full flex items-center pl-2 py-2 text-sm font-medium rounded-md"
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.href.split("/")[2] === atual[4]
                                ? "text-gray-500"
                                : "text-gray-400 group-hover:text-gray-500",
                              "mr-3 flex-shrink-0 h-6 w-6"
                            )}
                          />
                          {item.name}
                        </Link>
                      </div>
                    ) : (
                      <Disclosure
                        as="div"
                        key={item.name}
                        className="space-y-1"
                      >
                        {({ open }) => (
                          <>
                            <Disclosure.Button
                              className={classNames(
                                item.href.split("/")[2] === atual[4]
                                  ? "bg-gray-100 text-gray-900"
                                  : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                "group w-full flex items-center pl-2 pr-1 py-2 text-left text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              )}
                            >
                              <item.icon
                                className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                              <span className="flex-1">{item.name}</span>
                              <svg
                                className={classNames(
                                  open
                                    ? "text-gray-400 rotate-90"
                                    : "text-gray-300",
                                  "ml-3 h-5 w-5 flex-shrink-0 transition-rotate duration-150 ease-in-out group-hover:text-gray-400"
                                )}
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                              >
                                <path
                                  d="M6 6L14 10L6 14V6Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </Disclosure.Button>
                            <Disclosure.Panel className="space-y-1">
                              {item.children.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  to={subItem.href}
                                  className={classNames(
                                    subItem.href.split("/")[3] === atual[5]
                                      ? "bg-gray-100 text-gray-900"
                                      : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                    "group flex w-full items-center rounded-md py-2 pl-11 pr-2 text-sm font-medium"
                                  )}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    )
                  )}
                </nav>
              </div>
            ) : (
              extraComponent
            )}
            {/* need to convert to multi stackbar logic */}
          </div>
          <div className="w-full  flex content-center justify-center mt-auto mb-8">
          <button onClick={()=>uploadFlow()} className="flex content-center justify-center py-3 px-6 border rounded-lg border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"><span>import flow</span><ArrowUpTrayIcon className=" ml-2 w-5 h-5"/>  </button>
          </div>
        </div>
      </aside>
    </>
  );
}
