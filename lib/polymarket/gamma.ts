export const GAMMA_BASE_URL = "https://gamma-api.polymarket.com";

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

const buildUrl = (path: string, params?: Record<string, QueryValue>) => {
  const url = new URL(path, GAMMA_BASE_URL);

  if (!params) {
    return url.toString();
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry === null || entry === undefined) {
          return;
        }
        url.searchParams.append(key, String(entry));
      });
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

const gammaFetch = async <T>(
  path: string,
  params?: Record<string, QueryValue>,
  init?: RequestInit
): Promise<T> => {
  const url = buildUrl(path, params);
  const headers = new Headers(init?.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const message = text ? text.slice(0, 200) : response.statusText;
    throw new Error(`Gamma API error ${response.status}: ${message}`);
  }

  return (await response.json()) as T;
};

export interface GammaImageOptimized {
  imageUrlSource?: string | null;
  imageUrlOptimized?: string | null;
  imageSizeKbSource?: number | null;
  imageSizeKbOptimized?: number | null;
  imageOptimizedComplete?: boolean | null;
  imageOptimizedLastUpdated?: string | null;
  relID?: number | null;
  field?: string | null;
  relname?: string | null;
  [key: string]: unknown;
}

export interface GammaCategory {
  id?: string | null;
  label?: string | null;
  parentCategory?: string | null;
  slug?: string | null;
  publishedAt?: string | null;
  createdBy?: string | number | null;
  updatedBy?: string | number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface GammaTag {
  id?: string | null;
  label?: string | null;
  slug?: string | null;
  forceShow?: boolean | null;
  publishedAt?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  forceHide?: boolean | null;
  isCarousel?: boolean | null;
  [key: string]: unknown;
}

export interface GammaTagSummary {
  id?: string | null;
  label?: string | null;
  slug?: string | null;
  event_count?: number | null;
  [key: string]: unknown;
}

export interface GammaTemplate {
  id?: string | null;
  eventId?: string | null;
  name?: string | null;
  template?: string | null;
  slug?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
  createdBy?: string | number | null;
  updatedBy?: string | number | null;
  templateVariables?: string | null;
  [key: string]: unknown;
}

export interface GammaSeries {
  id?: string | null;
  ticker?: string | null;
  slug?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  startDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  published_at?: string | null;
  createdBy?: string | number | null;
  updatedBy?: string | number | null;
  category?: string | null;
  tags?: GammaTag[] | null;
  events?: GammaEvent[] | null;
  icon?: string | null;
  image?: string | null;
  active?: boolean | null;
  closed?: boolean | null;
  archived?: boolean | null;
  new?: boolean | null;
  featured?: boolean | null;
  restricted?: boolean | null;
  liquidity?: number | null;
  volume?: number | null;
  volume24hr?: number | null;
  volume1wk?: number | null;
  volume1mo?: number | null;
  volume1yr?: number | null;
  imageOptimized?: GammaImageOptimized | null;
  iconOptimized?: GammaImageOptimized | null;
  templates?: GammaTemplate[] | null;
  currencies?: string[] | null;
  negRisk?: boolean | null;
  negRiskFeeBips?: number | null;
  negRiskMarketID?: string | null;
  isTemplate?: boolean | null;
  templateVariables?: string | null;
  hideMarketUrl?: boolean | null;
  enableBanner?: boolean | null;
  showAllOutcomes?: boolean | null;
  showMarketImages?: boolean | null;
  enableEdit?: boolean | null;
  metadata?: string | null;
  relatedTags?: GammaTag[] | null;
  relatedMarkets?: GammaMarket[] | null;
  relID?: number | null;
  [key: string]: unknown;
}

export interface GammaClobReward {
  id?: string | null;
  market_id?: string | null;
  reward_amount?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  min_size?: string | null;
  max_spread?: string | null;
  asset_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}

export interface GammaMarket {
  id: string;
  question?: string | null;
  conditionId: string;
  slug?: string | null;
  twitterCardImage?: string | null;
  resolutionSource?: string | null;
  endDate?: string | null;
  startDate?: string | null;
  category?: string | null;
  description?: string | null;
  outcomes?: string | string[] | null;
  outcomePrices?: string | string[] | null;
  volume?: string | number | null;
  active?: boolean | null;
  closed?: boolean | null;
  marketMakerAddress?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  new?: boolean | null;
  featured?: boolean | null;
  submitted_by?: string | null;
  resolvedBy?: string | null;
  name?: string | null;
  archived?: boolean | null;
  restricted?: boolean | null;
  groupItemTitle?: string | null;
  groupItemThreshold?: number | null;
  questionID?: string | null;
  umaResolutionStatus?: string | null;
  umaResolutionStatusSetAt?: string | null;
  umaResolutionBlock?: number | null;
  umaResolutionBond?: string | null;
  umaResolutionExpiry?: string | null;
  umaResolutionValue?: string | null;
  volumeNum?: number | null;
  liquidityNum?: number | null;
  endDateIso?: string | null;
  startDateIso?: string | null;
  hasReviewedDates?: boolean | null;
  clobTokenIds?: string | string[] | null;
  liquidityAmm?: number | null;
  liquidityClob?: number | null;
  volumeClob?: number | null;
  volumeAmm?: number | null;
  volume24hr?: number | null;
  clobRewards?: GammaClobReward[] | null;
  volume7d?: number | null;
  volume30d?: number | null;
  volume1mo?: number | null;
  volume1wk?: number | null;
  volume1yr?: number | null;
  volumeDaily?: number | null;
  volumeWeekly?: number | null;
  volumeMonthly?: number | null;
  volumeYearly?: number | null;
  rewardMinSize?: number | null;
  rewardMaxSpread?: number | null;
  spread?: number | null;
  oneDayPriceChange?: number | null;
  lastTradePrice?: number | null;
  bestBid?: number | null;
  bestAsk?: number | null;
  automaticallyActive?: boolean | null;
  clearBookOnStart?: boolean | null;
  events?: GammaEvent[] | null;
  tags?: GammaTag[] | null;
  categories?: GammaCategory[] | null;
  imageOptimized?: GammaImageOptimized | null;
  iconOptimized?: GammaImageOptimized | null;
  featuredImageOptimized?: GammaImageOptimized | null;
  [key: string]: unknown;
}

export interface GammaEvent {
  id?: string | null;
  ticker?: string | null;
  slug?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  resolutionSource?: string | null;
  startDate?: string | null;
  creationDate?: string | null;
  endDate?: string | null;
  image?: string | null;
  icon?: string | null;
  active?: boolean | null;
  closed?: boolean | null;
  archived?: boolean | null;
  new?: boolean | null;
  featured?: boolean | null;
  restricted?: boolean | null;
  liquidity?: number | null;
  volume?: number | null;
  openInterest?: number | null;
  sortBy?: string | null;
  category?: string | null;
  subcategory?: string | null;
  isTemplate?: boolean | null;
  templateVariables?: string | null;
  published_at?: string | null;
  createdBy?: string | number | null;
  updatedBy?: string | number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  commentsEnabled?: boolean | null;
  competitive?: number | null;
  volume24hr?: number | null;
  volume1wk?: number | null;
  volume1mo?: number | null;
  volume1yr?: number | null;
  featuredImage?: string | null;
  disqusThread?: string | null;
  parentEvent?: string | null;
  enableOrderBook?: boolean | null;
  liquidityAmm?: number | null;
  liquidityClob?: number | null;
  negRisk?: boolean | null;
  negRiskMarketID?: string | null;
  negRiskFeeBips?: number | null;
  commentCount?: number | null;
  imageOptimized?: GammaImageOptimized | null;
  iconOptimized?: GammaImageOptimized | null;
  featuredImageOptimized?: GammaImageOptimized | null;
  events?: GammaEvent[] | null;
  categories?: GammaCategory[] | null;
  tags?: GammaTag[] | null;
  markets?: GammaMarket[] | null;
  series?: GammaSeries[] | null;
  templates?: GammaTemplate[] | null;
  relatedMarkets?: GammaMarket[] | null;
  relatedTags?: GammaTag[] | null;
  relID?: number | null;
  titleTags?: string | null;
  showAllOutcomes?: boolean | null;
  showMarketImages?: boolean | null;
  gameStartTime?: string | null;
  enableEdit?: boolean | null;
  automaticallyActive?: boolean | null;
  clearBookOnStart?: boolean | null;
  carouselMap?: string | null;
  pendingDeployment?: boolean | null;
  deploying?: boolean | null;
  deployingTimestamp?: string | null;
  scheduledDeploymentTimestamp?: string | null;
  gameStatus?: string | null;
  [key: string]: unknown;
}

export interface GammaProfile {
  id?: string | null;
  name?: string | null;
  user?: number | null;
  referral?: string | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  walletActivated?: boolean | null;
  pseudonym?: string | null;
  displayUsernamePublic?: boolean | null;
  profileImage?: string | null;
  profileImageOptimized?: string | null;
  profileBanner?: string | null;
  username?: string | null;
  slug?: string | null;
  subtitle?: string | null;
  bio?: string | null;
  websiteUrl?: string | null;
  twitterUsername?: string | null;
  followerCount?: number | null;
  address?: string | null;
  isVerified?: boolean | null;
  publicProfile?: boolean | null;
  enableBanners?: boolean | null;
  showBadge?: boolean | null;
  isStaff?: boolean | null;
  isPro?: boolean | null;
  showPredictedOutcome?: boolean | null;
  prefersAnonymous?: boolean | null;
  currentBetsCount?: number | null;
  positionsCount?: number | null;
  [key: string]: unknown;
}

export interface GammaPagination {
  hasMore?: boolean | null;
  totalResults?: number | null;
  [key: string]: unknown;
}

export interface GammaPublicSearchResponse {
  events?: GammaEvent[] | null;
  tags?: GammaTagSummary[] | null;
  profiles?: GammaProfile[] | null;
  pagination?: GammaPagination | null;
  [key: string]: unknown;
}

export interface GammaMarketsQuery {
  limit?: number;
  offset?: number;
  order?: string;
  ascending?: boolean;
  id?: number[];
  slug?: string[];
  clob_token_ids?: string[];
  condition_ids?: string[];
  market_maker_address?: string[];
  liquidity_num_min?: number;
  liquidity_num_max?: number;
  volume_num_min?: number;
  volume_num_max?: number;
  start_date_min?: string;
  start_date_max?: string;
  end_date_min?: string;
  end_date_max?: string;
  tag_id?: number;
  related_tags?: boolean;
  cyom?: boolean;
  uma_resolution_status?: string;
  game_id?: string;
  sports_market_types?: string[];
  rewards_min_size?: number;
  question_ids?: string[];
  include_tag?: boolean;
  closed?: boolean;
  active?: boolean;
  archived?: boolean;
}

export interface GammaPublicSearchQuery {
  q: string;
  cache?: boolean;
  events_status?: string;
  limit_per_type?: number;
  page?: number;
  events_tag?: string[];
  keep_closed_markets?: number;
  sort?: string;
  ascending?: boolean;
  search_tags?: boolean;
  search_profiles?: boolean;
  recurrence?: string;
  exclude_tag_id?: number[];
  optimized?: boolean;
}

export const listMarkets = (
  params?: GammaMarketsQuery,
  init?: RequestInit
): Promise<GammaMarket[]> => gammaFetch<GammaMarket[]>("/markets", params, init);

export const searchMarkets = (
  params: GammaPublicSearchQuery,
  init?: RequestInit
): Promise<GammaPublicSearchResponse> =>
  gammaFetch<GammaPublicSearchResponse>("/public-search", params, init);

export const getMarketBySlug = (
  slug: string,
  init?: RequestInit
): Promise<GammaMarket[]> =>
  gammaFetch<GammaMarket[]>("/markets", { slug: [slug] }, init);

export const getMarketById = (
  id: number,
  init?: RequestInit
): Promise<GammaMarket[]> => gammaFetch<GammaMarket[]>("/markets", { id: [id] }, init);
