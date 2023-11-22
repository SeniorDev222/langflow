import {
  ArrowUpToLine,
  Bell,
  BookMarked,
  BookmarkPlus,
  Boxes,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Circle,
  Clipboard,
  Code2,
  Compass,
  Copy,
  Cpu,
  Download,
  DownloadCloud,
  Edit,
  Eraser,
  ExternalLink,
  Eye,
  EyeOff,
  File,
  FileDown,
  FileSearch,
  FileSearch2,
  FileText,
  FileUp,
  Fingerprint,
  FolderPlus,
  Gift,
  GitBranchPlus,
  GitFork,
  GithubIcon,
  Group,
  Hammer,
  Heart,
  HelpCircle,
  Home,
  Info,
  Key,
  Laptop2,
  Layers,
  Lightbulb,
  Link,
  Loader2,
  Lock,
  LogIn,
  LucideSend,
  Maximize2,
  Menu,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Minimize2,
  Minus,
  MoonIcon,
  MoreHorizontal,
  Network,
  Paperclip,
  Pencil,
  Plus,
  Redo,
  Rocket,
  Save,
  SaveAll,
  Scissors,
  Search,
  Settings2,
  Share2,
  Shield,
  Sparkles,
  Square,
  Store,
  SunIcon,
  TerminalSquare,
  ToyBrick,
  Trash2,
  Undo,
  Ungroup,
  Unplug,
  Upload,
  User,
  UserCog2,
  UserMinus2,
  UserPlus2,
  Users2,
  Variable,
  Wand2,
  Workflow,
  Wrench,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { FaApple, FaGithub } from "react-icons/fa";
import { AWSIcon } from "../icons/AWS";
import { AirbyteIcon } from "../icons/Airbyte";
import { AnthropicIcon } from "../icons/Anthropic";
import { BingIcon } from "../icons/Bing";
import { ChromaIcon } from "../icons/ChromaIcon";
import { CohereIcon } from "../icons/Cohere";
import { EvernoteIcon } from "../icons/Evernote";
import { FBIcon } from "../icons/FacebookMessenger";
import { GitBookIcon } from "../icons/GitBook";
import { GoogleIcon } from "../icons/Google";
import { GradientInfinity } from "../icons/GradientSparkles";
import { HuggingFaceIcon } from "../icons/HuggingFace";
import { IFixIcon } from "../icons/IFixIt";
import { MetaIcon } from "../icons/Meta";
import { MidjourneyIcon } from "../icons/Midjorney";
import { MongoDBIcon } from "../icons/MongoDB";
import { NotionIcon } from "../icons/Notion";
import { OpenAiIcon } from "../icons/OpenAi";
import { PineconeIcon } from "../icons/Pinecone";
import { QDrantIcon } from "../icons/QDrant";
import { SearxIcon } from "../icons/Searx";
import SvgSlackIcon from "../icons/Slack/SlackIcon";
import { VertexAIIcon } from "../icons/VertexAI";
import SvgWikipedia from "../icons/Wikipedia/Wikipedia";
import SvgWolfram from "../icons/Wolfram/Wolfram";
import { HackerNewsIcon } from "../icons/hackerNews";
import { SupabaseIcon } from "../icons/supabase";
import { iconsType } from "../types/components";

export const gradients = [
  "bg-gradient-to-br from-gray-800 via-rose-700 to-violet-900",
  "bg-gradient-to-br from-green-200 via-green-300 to-blue-500",
  "bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-700",
  "bg-gradient-to-br from-green-200 via-green-400 to-purple-700",
  "bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500",
  "bg-gradient-to-br from-purple-400 to-yellow-400",
  "bg-gradient-to-br from-red-800 via-yellow-600 to-yellow-500",
  "bg-gradient-to-br from-blue-300 via-green-200 to-yellow-300",
  "bg-gradient-to-br from-blue-700 via-blue-800 to-gray-900",
  "bg-gradient-to-br from-green-300 to-purple-400",
  "bg-gradient-to-br from-yellow-200 via-pink-200 to-pink-400",
  "bg-gradient-to-br from-green-500 to-green-700",
  "bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500",
  "bg-gradient-to-br from-sky-400 to-blue-500",
  "bg-gradient-to-br from-green-200 via-green-400 to-green-500",
  "bg-gradient-to-br from-red-400 via-gray-300 to-blue-500",
  "bg-gradient-to-br from-gray-900 to-gray-600 bg-gradient-to-r",
  "bg-gradient-to-br from-rose-500 via-red-400 to-red-500",
  "bg-gradient-to-br from-fuchsia-600 to-pink-600",
  "bg-gradient-to-br from-emerald-500 to-lime-600",
  "bg-gradient-to-br from-rose-500 to-indigo-700",
  "bg-gradient-to-br bg-gradient-to-tr from-violet-500 to-orange-300",
  "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-600",
  "bg-gradient-to-br from-yellow-200 via-red-500 to-fuchsia-500",
  "bg-gradient-to-br from-sky-400 to-indigo-900",
  "bg-gradient-to-br from-amber-200 via-violet-600 to-sky-900",
  "bg-gradient-to-br from-amber-700 via-orange-300 to-rose-800",
  "bg-gradient-to-br from-gray-300 via-fuchsia-600 to-orange-600",
  "bg-gradient-to-br from-fuchsia-500 via-red-600 to-orange-400",
  "bg-gradient-to-br from-sky-400 via-rose-400 to-lime-400",
  "bg-gradient-to-br from-lime-600 via-yellow-300 to-red-600",
];

export const nodeColors: { [char: string]: string } = {
  prompts: "#4367BF",
  llms: "#6344BE",
  chains: "#FE7500",
  agents: "#903BBE",
  tools: "#FF3434",
  memories: "#F5B85A",
  advanced: "#000000",
  chat: "#198BF6",
  thought: "#272541",
  embeddings: "#42BAA7",
  documentloaders: "#7AAE42",
  vectorstores: "#AA8742",
  textsplitters: "#B47CB5",
  toolkits: "#DB2C2C",
  wrappers: "#E6277A",
  utilities: "#31A3CC",
  output_parsers: "#E6A627",
  str: "#049524",
  retrievers: "#e6b25a",
  unknown: "#9CA3AF",
  custom_components: "#ab11ab",
};

export const nodeNames: { [char: string]: string } = {
  prompts: "Prompts",
  llms: "LLMs",
  chains: "Chains",
  agents: "Agents",
  tools: "Tools",
  memories: "Memories",
  advanced: "Advanced",
  chat: "Chat",
  embeddings: "Embeddings",
  documentloaders: "Loaders",
  vectorstores: "Vector Stores",
  toolkits: "Toolkits",
  wrappers: "Wrappers",
  textsplitters: "Text Splitters",
  retrievers: "Retrievers",
  utilities: "Utilities",
  output_parsers: "Output Parsers",
  custom_components: "Custom",
  unknown: "Other",
};

export const nodeIconsLucide: iconsType = {
  ArrowUpToLine: ArrowUpToLine,
  Chroma: ChromaIcon,
  AirbyteJSONLoader: AirbyteIcon,
  AmazonBedrockEmbeddings: AWSIcon,
  Anthropic: AnthropicIcon,
  ChatAnthropic: AnthropicIcon,
  BingSearchAPIWrapper: BingIcon,
  BingSearchRun: BingIcon,
  Cohere: CohereIcon,
  CohereEmbeddings: CohereIcon,
  EverNoteLoader: EvernoteIcon,
  FacebookChatLoader: FBIcon,
  GitbookLoader: GitBookIcon,
  GoogleSearchAPIWrapper: GoogleIcon,
  GoogleSearchResults: GoogleIcon,
  GoogleSearchRun: GoogleIcon,
  HNLoader: HackerNewsIcon,
  HuggingFaceHub: HuggingFaceIcon,
  HuggingFaceEmbeddings: HuggingFaceIcon,
  IFixitLoader: IFixIcon,
  Meta: MetaIcon,
  Midjorney: MidjourneyIcon,
  MongoDBAtlasVectorSearch: MongoDBIcon,
  NotionDirectoryLoader: NotionIcon,
  ChatOpenAI: OpenAiIcon,
  OpenAI: OpenAiIcon,
  OpenAIEmbeddings: OpenAiIcon,
  Pinecone: PineconeIcon,
  Qdrant: QDrantIcon,
  Searx: SearxIcon,
  SlackDirectoryLoader: SvgSlackIcon,
  SupabaseVectorStore: SupabaseIcon,
  VertexAI: VertexAIIcon,
  ChatVertexAI: VertexAIIcon,
  VertexAIEmbeddings: VertexAIIcon,
  agents: Rocket,
  Workflow,
  User,
  WikipediaAPIWrapper: SvgWikipedia,
  chains: Link,
  memories: Cpu,
  llms: Lightbulb,
  prompts: TerminalSquare,
  tools: Wrench,
  advanced: Laptop2,
  chat: MessageCircle,
  embeddings: Fingerprint,
  documentloaders: Paperclip,
  vectorstores: Layers,
  toolkits: Hammer,
  textsplitters: Scissors,
  wrappers: Gift,
  utilities: Wand2,
  WolframAlphaAPIWrapper: SvgWolfram,
  output_parsers: Compass,
  retrievers: FileSearch,
  unknown: HelpCircle,
  WikipediaQueryRun: SvgWikipedia,
  WolframAlphaQueryRun: SvgWolfram,
  custom_components: GradientInfinity,
  custom: Edit,
  Trash2,
  Boxes,
  Network,
  X,
  XCircle,
  Info,
  CheckCircle2,
  Zap,
  MessagesSquare,
  ExternalLink,
  ChevronsUpDown,
  Check,
  Home,
  Users2,
  SunIcon,
  MoonIcon,
  Bell,
  ChevronLeft,
  ChevronDown,
  Shield,
  Plus,
  Redo,
  Settings2,
  Undo,
  FileSearch2,
  ChevronRight,
  Circle,
  Clipboard,
  Code2,
  Variable,
  Store,
  Download,
  Eraser,
  Lock,
  LucideSend,
  Sparkles,
  DownloadCloud,
  File,
  FileText,
  FolderPlus,
  GitFork,
  GithubIcon,
  FileDown,
  FileUp,
  Menu,
  Save,
  Search,
  Copy,
  Upload,
  MessageSquare,
  MoreHorizontal,
  UserMinus2,
  UserPlus2,
  Pencil,
  ChevronsRight,
  ChevronsLeft,
  FaGithub,
  FaApple,
  EyeOff,
  Eye,
  UserCog2,
  Key,
  Unplug,
  Group,
  LogIn,
  ChevronUp,
  Ungroup,
  BookMarked,
  Minus,
  Square,
  Minimize2,
  Maximize2,
  SaveAll,
  Share2,
  GitBranchPlus,
  Loader2,
  BookmarkPlus,
  Heart,
  Link,
  ToyBrick,
};
