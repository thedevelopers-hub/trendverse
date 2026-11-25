import type { LiveNewsItem } from '../types.js';

const INDIA_CONTENT_RX =
  /\b(india|indian|new delhi|delhi|mumbai|bengaluru|bangalore|hyderabad|chennai|kolkata|pune|ahmedabad|gurugram|gurgaon|noida|kochi|jaipur|chandigarh|lucknow|surat|bhopal|patna|guwahati|goa|kashmir|maharashtra|karnataka|tamil nadu|telangana|kerala|gujarat|uttar pradesh|west bengal|rajasthan|madhya pradesh|odisha|bihar|punjab|haryana|assam|rbi|sebi|isro|drdo|niti aayog|meity|trai|npci|upi|aadhaar|ondc|pli|make in india|digital india|lok sabha|rajya sabha|union budget|nirmala sitharaman|modi|jaishankar|sensex|nifty|bse|nse|rupee|inr|crore|lakh|infosys|tcs|wipro|hcltech|tech mahindra|reliance|jio|tata|adani|mahindra|bajaj|bharti airtel|airtel|flipkart|zomato|swiggy|paytm|ola|nykaa|phonepe|razorpay|zerodha|zepto|meesho|freshworks|zoho|lenskart|blinkit|groww|cred|pine labs|byju|physicswallah|alembic|cipla|sun pharma|dr reddy|biocon|lupin|serum institute|iit|iim|iisc|iffi|bollywood|tollywood|kollywood|sandalwood|mollywood|sudha ragunathan|aparna sen|raga|carnatic|hindustani|filmfare|doordarshan|bcci|ipl)\b/i;

const FOREIGN_ONLY_GEO_RX =
  /\b(united states|u\.s\.|usa|white house|wall street|fcc|congress|senate|trump|biden|united kingdom|uk|britain|british|london|england|scotland|nhs|poundland|malaysia|kuala lumpur|china|chinese|beijing|shanghai|japan|japanese|tokyo|osaka|germany|german|berlin|munich|france|french|paris|australia|australian|sydney|melbourne|canada|canadian|ottawa|toronto|brazil|nigeria|nollywood|russia|ukraine)\b/i;

const COUNTRY_KEYWORD_MAP: Record<string, RegExp> = {
  India: INDIA_CONTENT_RX,
  'United States': /\b(united states|u\.s\.|usa|washington|new york|california|silicon valley|white house|wall street|fcc|congress|senate|nasa)\b/i,
  'United Kingdom': /\b(united kingdom|uk|britain|british|london|england|scotland|nhs|poundland)\b/i,
  Australia: /\b(australia|australian|sydney|melbourne|canberra)\b/i,
  Japan: /\b(japan|japanese|tokyo|osaka)\b/i,
  Germany: /\b(germany|german|berlin|munich|frankfurt)\b/i,
  France: /\b(france|french|paris|lyon)\b/i,
  Canada: /\b(canada|canadian|ottawa|toronto|vancouver)\b/i,
  Global: /\b(global|united nations|world|international|worldwide)\b/i,
};

const TECH_CENTRAL_RX =
  /\b(ai|artificial intelligence|llm|generative ai|machine learning|deep learning|neural network|algorithm|software|saas|cloud computing|cybersecurity|cyber attack|cyberattack|ransomware|malware|data breach|hacked|hacker|hacking|encryption|smartphone|iphone|android|pixel|galaxy|laptop|wearable|chip|chips|semiconductor|foundry|processor|gpu|cpu|nvidia|qualcomm|amd|intel|tsmc|startup|startups|tech startup|fintech|deeptech|spacetech|edtech|robotics|robot|humanoid|drone|quantum computing|5g|6g|telecom|broadband|starlink|satellite internet|open source|developer|programming|operating system|app store|data cent(er|re)|digital infrastructure|digital platform|ev battery|autonomous vehicle|tech|technology)\b/i;

const TECH_EXCLUSION_RX =
  /\b(cricket|ipl|football|soccer|tennis|badminton|hockey|golf|olympics|box office|movie review|film review|film festival|cinema|actor|actress|singer|concert|album|raga|assembly election|seat-sharing|lok sabha|parliament|cabinet|gdp|interest rate|inflation|repo rate|fda nod|cancer drug|pharma|cement|steel|monsoon|weather forecast|stocks fall|stock market|wall street|traded .* shares|share trading|account traded|trump|republican|democrat|senate|congress|fbi|cia)\b/i;

const BUSINESS_CENTRAL_RX =
  /\b(business|economy|economic|gdp|inflation|interest rate|repo rate|rbi|fed|central bank|trade|tariff|export|import|manufacturing|pli|industry|market|markets|stock|stocks|sensex|nifty|bse|nse|ipo|funding|venture capital|investor|investment|valuation|revenue|profit|earnings|quarterly results|merger|acquisition|bank|banking|finance|financial|pharma|fda|auto|retail|energy|rupee|inr|dollar|tax|budget|fiscal|job cuts|layoffs|bankruptcy|collapse|regulator|sebi|cci)\b/i;

const BUSINESS_EXCLUSION_RX =
  /\b(movie review|film review|concert|raga|song|album|cricket match|football match|celebrity|oscars|grammy)\b/i;

const ENT_CENTRAL_RX =
  /\b(film|films|movie|movies|cinema|review|actor|actress|director|music|concert|raga|song|album|film festival|music festival|iffi|oscar|grammy|emmy|bafta|box office|streaming|netflix|prime video|theatre|theater|drama|comedy|television|tv show|series|web series|celebrity|photography|exhibition|art|literature|novel|author|bollywood|hollywood|tollywood|kollywood)\b/i;

const ENT_EXCLUSION_RX =
  /\b(cybersecurity|ransomware|semiconductor|chipmaker|repo rate|gdp|inflation|assembly election|seat-sharing|tariff|sports fest|alumni|cxos|management institutions|quarterly results)\b/i;

const AI_CENTRAL_RX =
  /\b(ai|artificial intelligence|llm|machine learning|generative ai|neural|openai|anthropic|gemini|deepmind|copilot|chatbot|agentic)\b/i;

const SCIENCE_CENTRAL_RX =
  /\b(science|scientific|research|study|physics|biology|chemistry|medical|medicine|genome|fossil|archaeology|astronomy|neuroscience|vaccine|clinical trial)\b/i;

const SPACE_CENTRAL_RX =
  /\b(space|nasa|isro|esa|spacex|orbit|orbital|rocket|launch|moon|lunar|mars|telescope|jwst|asteroid|astronaut|satellite)\b/i;

const CLIMATE_CENTRAL_RX =
  /\b(climate|carbon|emissions|net zero|renewable|solar|wind power|global warming|cop\d+|wildfire|glacier|biodiversity)\b/i;

const WORLD_CENTRAL_RX =
  /\b(world|diplom|treaty|summit|united nations|foreign|ceasefire|sanctions|geopolitic|bilateral)\b/i;

export function matchesCountryStrict(item: LiveNewsItem, countryPref: string): boolean {
  if (!countryPref || countryPref === 'All Countries') return true;
  const text = `${item.title} ${item.summary} ${item.url}`;

  if (countryPref === 'Global') {
    return item.countryTag === 'Global' || COUNTRY_KEYWORD_MAP.Global.test(text);
  }

  if (countryPref === 'India') {
    if (INDIA_CONTENT_RX.test(text)) return true;
    // If publisher/desk is India-specific, allow only when it is NOT a foreign-jurisdiction syndication
    if (item.countryTag === 'India' && !FOREIGN_ONLY_GEO_RX.test(text)) {
      return (
        item.sourceId === 'bbc-india' ||
        item.sourceId === 'the-hindu' ||
        item.category === 'India' ||
        item.url.includes('/news/national/') ||
        item.url.includes('/india/')
      );
    }
    return false;
  }

  const rx = COUNTRY_KEYWORD_MAP[countryPref];
  if (rx && rx.test(text)) {
    return true;
  }
  return item.countryTag.toLowerCase() === countryPref.toLowerCase();
}

export function matchesCategoryStrict(item: LiveNewsItem, categoryPref: string): boolean {
  if (!categoryPref || categoryPref === 'All Categories') return true;
  const text = `${item.title} ${item.summary}`;

  switch (categoryPref) {
    case 'Technology': {
      const hasTech = TECH_CENTRAL_RX.test(text);
      const isTechDesk =
        item.category === 'Technology' || item.category === 'Artificial Intelligence';
      const hasExcluded = TECH_EXCLUSION_RX.test(text);
      if (hasExcluded && !isTechDesk) return false;
      if (isTechDesk && !hasExcluded) return true;
      if (hasTech && !hasExcluded) return true;
      return false;
    }
    case 'Artificial Intelligence':
      return AI_CENTRAL_RX.test(text) || item.category === 'Artificial Intelligence';
    case 'Business': {
      const hasExcluded = BUSINESS_EXCLUSION_RX.test(text) && !BUSINESS_CENTRAL_RX.test(item.title);
      if (hasExcluded) return false;
      return item.category === 'Business' || BUSINESS_CENTRAL_RX.test(text);
    }
    case 'Entertainment': {
      const isEntDesk = item.category === 'Entertainment';
      const hasExcluded = ENT_EXCLUSION_RX.test(text);
      if (hasExcluded && !isEntDesk) return false;
      return isEntDesk || (ENT_CENTRAL_RX.test(text) && !hasExcluded);
    }
    case 'Science':
      return item.category === 'Science' || SCIENCE_CENTRAL_RX.test(text);
    case 'Space':
      return item.category === 'Space' || SPACE_CENTRAL_RX.test(text);
    case 'Climate':
      return item.category === 'Climate' || CLIMATE_CENTRAL_RX.test(text);
    case 'World':
      return item.category === 'World' || item.category === 'Climate' || WORLD_CENTRAL_RX.test(text);
    case 'India':
      return matchesCountryStrict(item, 'India');
    default:
      return item.category.toLowerCase() === categoryPref.toLowerCase();
  }
}

export function selectStrictMatchingCandidates(
  items: LiveNewsItem[],
  countryPref: string,
  categoryPref: string,
  maxTarget: number
): { candidates: LiveNewsItem[]; note: string; totalMatched: number } {
  const hasCountryFilter = countryPref !== 'All Countries';
  const hasCategoryFilter = categoryPref !== 'All Categories';

  // Always prioritize genuinely recent articles first
  const sortedByRecency = [...items].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );

  const matched = sortedByRecency.filter(
    (item) =>
      matchesCountryStrict(item, countryPref) && matchesCategoryStrict(item, categoryPref)
  );

  const capped = matched.slice(0, maxTarget);

  if (!hasCountryFilter && !hasCategoryFilter) {
    return {
      candidates: capped,
      totalMatched: matched.length,
      note:
        matched.length < maxTarget
          ? `${matched.length} verified matching ${matched.length === 1 ? 'story' : 'stories'} found.`
          : '',
    };
  }

  const filterLabel =
    hasCountryFilter && hasCategoryFilter
      ? `${countryPref} + ${categoryPref}`
      : hasCountryFilter
      ? countryPref
      : categoryPref;

  let note = '';
  if (matched.length === 0) {
    note = `0 verified matching stories found for ${filterLabel}. Fewer stories are shown rather than including unrelated international coverage.`;
  } else if (matched.length < maxTarget) {
    note = `${matched.length} verified matching ${matched.length === 1 ? 'story' : 'stories'} found for ${filterLabel}. Showing only relevant stories rather than filling to ${maxTarget} with unrelated news.`;
  }

  return {
    candidates: capped,
    totalMatched: matched.length,
    note,
  };
}
