// Static content configuration for the website
// This will be editable by admin through the UI

export interface AboutContent {
  mission: {
    en: string;
    am: string;
  };
  vision: {
    en: string;
    am: string;
  };
  values: {
    en: string[];
    am: string[];
  };
  history: {
    en: string;
    am: string;
  };
  objectives: {
    en: string[];
    am: string[];
  };
}

export interface HomeContent {
  hero: {
    title: {
      en: string;
      am: string;
    };
    subtitle: {
      en: string;
      am: string;
    };
  };
  features: Array<{
    title: { en: string; am: string };
    description: { en: string; am: string };
    icon: string;
  }>;
  stats: Array<{
    label: { en: string; am: string };
    value: number;
  }>;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  fax?: string;
  poBox?: string;
  mapUrl?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    telegram?: string;
  };
}

// Default content - will be loaded from localStorage or API
export const defaultAboutContent: AboutContent = {
  mission: {
    en: "To unite and strengthen workers in the transport and communication sectors, advocating for their rights, improving working conditions, and fostering solidarity among all members.",
    am: "በትራንስፖርት እና ኮሙኒኬሽን ዘርፎች ውስጥ ሠራተኞችን አንድ ማድረግ እና ማጠናከር፣ ለመብታቸው መከራከር፣ የስራ ሁኔታዎችን ማሻሻል እና በሁሉም አባላት መካከል አንድነትን ማጠናከር።"
  },
  vision: {
    en: "A strong, united federation of transport and communication workers, where every member enjoys fair treatment, safe working conditions, and opportunities for growth and development.",
    am: "ጠንካራ እና የተዋሃደ የትራንስፖርት እና ኮሙኒኬሽን ሠራተኞች ፌዴሬሽን፣ እያንዳንዱ አባል ፍትሃዊ አያያዝ፣ ደህንነቱ የተጠበቀ የስራ ሁኔታዎች እና ለእድገት እና ለዕድገት እድሎችን የሚያገኝበት።"
  },
  values: {
    en: [
      "Solidarity and Unity",
      "Transparency and Accountability",
      "Democracy and Participation",
      "Social Justice and Equality",
      "Continuous Learning and Development"
    ],
    am: [
      "አንድነት እና መተሳሰብ",
      "ግልፅነት እና ተጠያቂነት",
      "ዴሞክራሲ እና ተሳትፎ",
      "ማህበራዊ ፍትህ እና እኩልነት",
      "ቀጣይነት ያለው መማር እና እድገት"
    ]
  },
  history: {
    en: "The Transport and Communication Workers Federation was established to represent and protect the interests of workers across Ethiopia's vital transport and communication sectors. Since our founding, we have been at the forefront of advocating for workers' rights, negotiating fair collective bargaining agreements, and providing support and services to our member unions and their members.",
    am: "የትራንስፖርት እና ኮሙኒኬሽን ሠራተኞች ፌዴሬሽን በኢትዮጵያ ወሳኝ የትራንስፖርት እና የኮሙኒኬሽን ዘርፎች ውስጥ የሠራተኞችን ጥቅም ለመወከል እና ለመጠበቅ ተቋቁሟል። ከተመሠረትነው ጀምሮ ለሠራተኞች መብቶች በመከራከር፣ ፍትሃዊ የጋራ የስምምነቶችን በመደራደር እና ለአባል ማህበራቶቻችን እና ለአባላቶቻቸው ድጋፍ እና አገልግሎቶችን በመስጠት ፊትለፊት ቆይተናል።"
  },
  objectives: {
    en: [
      "Protect and advance the rights and interests of transport and communication workers",
      "Negotiate and enforce collective bargaining agreements",
      "Provide education, training, and capacity building for members",
      "Promote safe and healthy working environments",
      "Foster solidarity and cooperation among member unions",
      "Represent workers' interests in policy discussions and legislation",
      "Support members in resolving workplace disputes",
      "Promote gender equality and youth participation"
    ],
    am: [
      "የትራንስፖርት እና ኮሙኒኬሽን ሠራተኞችን መብቶች እና ጥቅሞች መጠበቅ እና ማሳደግ",
      "የጋራ የስምምነቶችን መደራደር እና መተግበር",
      "ለአባላት ትምህርት፣ ስልጠና እና አቅም ግንባታ ማቅረብ",
      "ደህንነቱ የተጠበቀ እና ጤናማ የስራ አካባቢዎችን ማስተዋወቅ",
      "በአባል ማህበራቶች መካከል አንድነትን እና ትብብርን ማጠናከር",
      "በፖሊሲ ውይይቶች እና በህግ አውጭነት ውስጥ የሠራተኞችን ጥቅም መወከል",
      "አባላትን በሥራ ቦታ ውስጥ ያሉ አለመግባባቶችን በመፍታት መደገፍ",
      "የፆታ እኩልነትን እና የወጣቶችን ተሳትፎ ማስተዋወቅ"
    ]
  }
};

export const defaultHomeContent: HomeContent = {
  hero: {
    title: {
      en: "Transport & Communication Workers Federation",
      am: "የትራንስፖርት እና ኮሙኒኬሽን ሠራተኞች ፌዴሬሽን"
    },
    subtitle: {
      en: "United for Stronger Rights, Better Future",
      am: "ለጠንካራ መብቶች፣ ለተሻለ ወደፊት አንድ ሆነናል"
    }
  },
  features: [
    {
      title: { en: "Worker Protection", am: "የሠራተኞች ጥበቃ" },
      description: {
        en: "Advocating for fair wages, safe working conditions, and workers' rights",
        am: "ለፍትሃዊ ደሞዝ፣ ደህንነቱ የተጠበቀ የስራ ሁኔታዎች እና የሠራተኞች መብቶች መከራከር"
      },
      icon: "shield"
    },
    {
      title: { en: "Collective Bargaining", am: "የጋራ ድርድር" },
      description: {
        en: "Negotiating agreements that benefit all members and their families",
        am: "ለሁሉም አባላት እና ለቤተሰቦቻቸው የሚጠቅሙ ስምምነቶችን መደራደር"
      },
      icon: "handshake"
    },
    {
      title: { en: "Training & Development", am: "ስልጠና እና እድገት" },
      description: {
        en: "Providing continuous education and skill development programs",
        am: "ቀጣይነት ያለው ትምህርት እና የክህሎት ማሻሻያ ፕሮግራሞችን ማቅረብ"
      },
      icon: "graduation"
    },
    {
      title: { en: "Legal Support", am: "የህግ ድጋፍ" },
      description: {
        en: "Offering legal assistance and representation for workplace issues",
        am: "ለስራ ቦታ ጉዳዮች የህግ ድጋፍ እና ውክልና ማቅረብ"
      },
      icon: "scale"
    }
  ],
  stats: [
    { label: { en: "Member Unions", am: "አባል ማህበራት" }, value: 0 },
    { label: { en: "Total Members", am: "ጠቅላላ አባላት" }, value: 0 },
    { label: { en: "Active CBAs", am: "ንቁ የጋራ ስምምነቶች" }, value: 0 },
    { label: { en: "Years of Service", am: "የአገልግሎት ዓመታት" }, value: 15 }
  ]
};

// This will be loaded from .env and editable in admin panel
export const getContactInfo = (): ContactInfo => {
  return {
    address: import.meta.env.VITE_CONTACT_ADDRESS || "Addis Ababa, Ethiopia",
    phone: import.meta.env.VITE_CONTACT_PHONE || "+251-11-XXX-XXXX",
    email: import.meta.env.VITE_CONTACT_EMAIL || "info@tcwf-ethiopia.org",
    fax: import.meta.env.VITE_CONTACT_FAX || "",
    poBox: import.meta.env.VITE_CONTACT_PO_BOX || "P.O. Box XXXX",
    mapUrl: import.meta.env.VITE_CONTACT_MAP_URL || "",
    socialMedia: {
      facebook: import.meta.env.VITE_SOCIAL_FACEBOOK || "",
      twitter: import.meta.env.VITE_SOCIAL_TWITTER || "",
      linkedin: import.meta.env.VITE_SOCIAL_LINKEDIN || "",
      telegram: import.meta.env.VITE_SOCIAL_TELEGRAM || ""
    }
  };
};

// Helper to save/load content from localStorage
export const saveContentToStorage = (key: string, content: unknown) => {
  localStorage.setItem(`tcwf_content_${key}`, JSON.stringify(content));
};

export const loadContentFromStorage = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(`tcwf_content_${key}`);
  return stored ? JSON.parse(stored) : defaultValue;
};

