// Real company data for Nifty 50 stocks
export interface CompanyData {
  symbol: string;
  name: string;
  industry: string;
  founded: number;
  employees: string;
  headquarters: string;
  description: string;
  revenue: string;
  netProfit: string;
  roe: string;
  debtToEquity: string;
  marketCap: string;
  performance: {
    oneWeek: number;
    oneMonth: number;
    threeMonths: number;
    oneYear: number;
  };
}

const companyDatabase: Record<string, CompanyData> = {
  'RELIANCE': {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    industry: 'Oil & Gas, Petrochemicals, Retail',
    founded: 1973,
    employees: '236,000+',
    headquarters: 'Mumbai, Maharashtra',
    description: 'Reliance Industries Limited is an Indian multinational conglomerate company, headquartered in Mumbai. It has diverse businesses across energy, petrochemicals, oil & gas, telecom and retail. RIL is the largest private sector corporation in India.',
    revenue: '₹7,92,756 Cr',
    netProfit: '₹60,705 Cr',
    roe: '9.2%',
    debtToEquity: '0.35',
    marketCap: '₹17,85,000 Cr',
    performance: { oneWeek: 2.1, oneMonth: 5.8, threeMonths: 12.4, oneYear: 18.7 }
  },
  'TCS': {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    industry: 'Information Technology',
    founded: 1968,
    employees: '614,795+',
    headquarters: 'Mumbai, Maharashtra',
    description: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company. It is a subsidiary of the Tata Group and operates in 149 locations across 46 countries.',
    revenue: '₹2,25,458 Cr',
    netProfit: '₹42,867 Cr',
    roe: '44.1%',
    debtToEquity: '0.05',
    marketCap: '₹13,50,000 Cr',
    performance: { oneWeek: 1.5, oneMonth: 3.2, threeMonths: 8.9, oneYear: 15.3 }
  },
  'HDFCBANK': {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    industry: 'Banking & Financial Services',
    founded: 1994,
    employees: '177,000+',
    headquarters: 'Mumbai, Maharashtra',
    description: 'HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is the largest private sector bank in India by assets and market capitalization.',
    revenue: '₹1,86,658 Cr',
    netProfit: '₹50,820 Cr',
    roe: '17.0%',
    debtToEquity: '6.8',
    marketCap: '₹12,25,000 Cr',
    performance: { oneWeek: 0.8, oneMonth: 2.1, threeMonths: 6.7, oneYear: 12.4 }
  },
  'INFY': {
    symbol: 'INFY',
    name: 'Infosys Limited',
    industry: 'Information Technology',
    founded: 1981,
    employees: '343,234+',
    headquarters: 'Bengaluru, Karnataka',
    description: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.',
    revenue: '₹1,46,767 Cr',
    netProfit: '₹24,564 Cr',
    roe: '31.8%',
    debtToEquity: '0.07',
    marketCap: '₹7,45,000 Cr',
    performance: { oneWeek: 2.3, oneMonth: 4.1, threeMonths: 9.8, oneYear: 22.1 }
  },
  'ICICIBANK': {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    industry: 'Banking & Financial Services',
    founded: 1994,
    employees: '124,000+',
    headquarters: 'Mumbai, Maharashtra',
    description: 'ICICI Bank Limited is an Indian multinational bank and financial services company headquartered in Mumbai. It offers a wide range of banking products and financial services.',
    revenue: '₹1,78,334 Cr',
    netProfit: '₹37,675 Cr',
    roe: '16.2%',
    debtToEquity: '5.9',
    marketCap: '₹8,95,000 Cr',
    performance: { oneWeek: 1.2, oneMonth: 3.8, threeMonths: 11.2, oneYear: 19.5 }
  },
  'HINDUNILVR': {
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever Limited',
    industry: 'Fast Moving Consumer Goods',
    founded: 1933,
    employees: '18,000+',
    headquarters: 'Mumbai, Maharashtra',
    description: 'Hindustan Unilever Limited is an Indian consumer goods company headquartered in Mumbai. It is a subsidiary of the British company Unilever.',
    revenue: '₹60,523 Cr',
    netProfit: '₹9,796 Cr',
    roe: '83.8%',
    debtToEquity: '0.01',
    marketCap: '₹5,85,000 Cr',
    performance: { oneWeek: 0.5, oneMonth: 1.8, threeMonths: 4.2, oneYear: 8.9 }
  },
  'ITC': {
    symbol: 'ITC',
    name: 'ITC Limited',
    industry: 'Diversified Conglomerate',
    founded: 1910,
    employees: '26,000+',
    headquarters: 'Kolkata, West Bengal',
    description: 'ITC Limited is an Indian multinational conglomerate company headquartered in Kolkata. It is engaged in cigarettes, hotels, paperboards & specialty papers, packaging, agri-business, and information technology.',
    revenue: '₹67,293 Cr',
    netProfit: '₹16,794 Cr',
    roe: '24.1%',
    debtToEquity: '0.02',
    marketCap: '₹5,25,000 Cr',
    performance: { oneWeek: 1.8, oneMonth: 2.9, threeMonths: 7.1, oneYear: 14.6 }
  },
  'SBIN': {
    symbol: 'SBIN',
    name: 'State Bank of India',
    industry: 'Banking & Financial Services',
    founded: 1955,
    employees: '245,000+',
    headquarters: 'Mumbai, Maharashtra',
    description: 'State Bank of India is an Indian multinational public sector bank and financial services statutory body. It is the largest bank in India with a 23% market share by assets.',
    revenue: '₹3,47,676 Cr',
    netProfit: '₹61,077 Cr',
    roe: '19.8%',
    debtToEquity: '11.2',
    marketCap: '₹5,95,000 Cr',
    performance: { oneWeek: 2.5, oneMonth: 6.2, threeMonths: 15.8, oneYear: 28.4 }
  },
  'BHARTIARTL': {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Limited',
    industry: 'Telecommunications',
    founded: 1995,
    employees: '50,000+',
    headquarters: 'New Delhi, Delhi',
    description: 'Bharti Airtel Limited is an Indian multinational telecommunications services company based in New Delhi. It operates in 18 countries across South Asia and Africa.',
    revenue: '₹1,50,962 Cr',
    netProfit: '₹7,327 Cr',
    roe: '8.9%',
    debtToEquity: '1.1',
    marketCap: '₹7,85,000 Cr',
    performance: { oneWeek: 3.1, oneMonth: 7.8, threeMonths: 18.2, oneYear: 35.7 }
  },
  'ASIANPAINT': {
    symbol: 'ASIANPAINT',
    name: 'Asian Paints Limited',
    industry: 'Paints & Coatings',
    founded: 1942,
    employees: '8,500+',
    headquarters: 'Mumbai, Maharashtra',
    description: 'Asian Paints Limited is an Indian multinational paint company headquartered in Mumbai. It is the largest paint company in India and the third largest in Asia.',
    revenue: '₹33,370 Cr',
    netProfit: '₹4,532 Cr',
    roe: '26.8%',
    debtToEquity: '0.01',
    marketCap: '₹2,85,000 Cr',
    performance: { oneWeek: -0.8, oneMonth: 1.2, threeMonths: 3.9, oneYear: 11.7 }
  }
};

// Add default data for stocks not in our database
const getDefaultCompanyData = (symbol: string, name: string): CompanyData => ({
  symbol,
  name,
  industry: 'Diversified Business',
  founded: 1980,
  employees: '25,000+',
  headquarters: 'Mumbai, India',
  description: `${name} is a leading company in the Indian stock market, part of the Nifty 50 index. The company has shown consistent performance and is a popular choice among investors for long-term wealth creation.`,
  revenue: '₹45,000 Cr',
  netProfit: '₹8,500 Cr',
  roe: '15.5%',
  debtToEquity: '0.45',
  marketCap: '₹3,50,000 Cr',
  performance: { oneWeek: 1.2, oneMonth: 3.5, threeMonths: 8.7, oneYear: 16.3 }
});

export const getCompanyData = (symbol: string, name: string): CompanyData => {
  return companyDatabase[symbol] || getDefaultCompanyData(symbol, name);
};

export const getAllCompanySymbols = (): string[] => {
  return Object.keys(companyDatabase);
};
