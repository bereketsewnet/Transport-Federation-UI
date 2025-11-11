// Static content configuration for the website
// This will be editable by admin through the UI

export interface Executive {
  id: string;
  name: {
    en: string;
    am: string;
  };
  position: {
    en: string;
    am: string;
  };
  image?: string; // base64 or URL
  bio?: {
    en: string;
    am: string;
  };
}

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
  structure: {
    title: {
      en: string;
      am: string;
    };
    departments: {
      en: string[];
      am: string[];
    };
  };
  stakeholders: {
    title: {
      en: string;
      am: string;
    };
    list: {
      en: string[];
      am: string[];
    };
  };
  executives: Executive[];
  otherExperts: Executive[]; // For carousel
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
    en: "To organize workers in unions, build their comprehensive capacity, and ensure their rights and interests are respected and enforced; promote industrial peace by increasing production and productivity; and contribute to the country's overall development through active participation in a safe and healthy work environment.",
    am: "ሠራተኛዉን በማኅበር በማደራጀትና ሁለንተናዊ አቅሙን በመገንባት መብትና ጥቅሙን እንዲያከብር ማድረግና ማስከበር፤ ምርትና ምርታማነትን በማሳደግ የኢንዱስትሪ ሠላም እንዲሰፍን፤ ደህንነቱና ጤንንቱ የተጠበቀ የሀገሪቷን ሁለንተናዊ እድገት ንቁ ተሳትፎ በማድረግ የበኩሉን አስተዋጽኦ ማበርከት፡፡"
  },
  vision: {
    en: "To see workers with guaranteed job security, respected rights and privileges, ensured occupational health and safety, and improved livelihoods.",
    am: "የሥራ ዋስትናው የተረጋገጠ፣ መብትና ጥቅሙ የተከበረ፣ የሙያ ደህንነትና ጤንነቱ የተጠበቀ፣ ኑሮው የተሻሻለ ሠራተኛ ማየት፡፡"
  },
  values: {
    en: [
      "Humanity",
      "Commitment",
      "Democratic Culture",
      "Industrial Peace",
      "Social Dialogue",
      "Transparency"
    ],
    am: [
      "ሰበዓዊነት",
      "ቁርጠኝነት",
      "የዲሞክራሲ ባህል",
      "የኢንዱስትሪ ሠላም",
      "ማኅበራዊ ምክክር",
      "ግልጸኝነት"
    ]
  },
  history: {
    en: "Industrial Federation of Transport and Communication Trade Unions was re-established in November 1974 E.C at a meeting held at the 8th floor of the CETU Building. The federation has held 13 regular general assemblies and 48 council meetings. The Federation is a legally mandated trade union federation organizing workers in Transport (civil aviation, road and railway, seafarers, urban transport) and communication sectors. It is established in accordance with the EFDRE Constitution and ILO core conventions. The Federation is a member of CETU nationally and International Transport Workers Federation globally. Since its establishment, the Federation has been providing legal services, training workers, engaging in advocacy campaigns, conducting research, and influencing policy to ensure decent work for transport workers.",
    am: "የትራንስፖርትና መገናኛ ሠራተኞች ማኅበራት ኢንዱስትሪ ፌዴሬሽን ህዳር ቀን 1974 ዓ.ም አዲስ አበባ ቂርቆስ ክፍለ ከተማ ኢሠማኮ ህንጻ 8ኛ ፎቅ ላይ በተደረገ ጉባኤ እንደገና ተመሠረተ፡፡ ፌዴሬሽኑ እስካሁን ድረስ 13 መደበኛ የጠቅላላ ጉባዔ እና 48 የምክር ቤት ስብሰባዎችን አካሂዷል። ፌዴሬሽኑ በትራንስፖርት እና በኮሙዩኒኬሽን ዘርፎች የተሰማሩ ሠራተኞችን በሕጋዊ መንገድ የሚያደራጅ ነው። ፌዴሬሽኑ በኢፌዴሪ ሕገ መንግሥት እና የILO ዋና ስምምነቶች መሠረት የተቋቋመ ሲሆን በብሔራዊ ደረጃ የሠራተኛ ማህበር ማዕከል CETU እና በዓለም አቀፍ ደረጃ የዓለም አቀፍ የትራንስፖርት ሠራተኞች ፌዴሬሽን አባል ነው። ፌዴሬሽኑ ከተቋቋመበት ጊዜ አንስቶ የህግ አገልግሎቶችን በመስጠት፣ ሰራተኞችን በማሰልጠን፣ የግንዛቤ ማስጨበጫ ሥራዎችን በመስራት፣ ጥናትና ምርምር በማካሄድ ለትራንስፖርት ሰራተኞች ምቹ የስራ ሁኔታን ለማረጋገጥ እየሰራ ይገኛል።"
  },
  objectives: {
    en: [
      "To organize unions in accordance with the country's labor law to ensure that workers' rights and interests are protected",
      "Empowering/strengthening the capacity of workers through education and training",
      "To participate actively in the international labor movement"
    ],
    am: [
      "በአገሪቱ የአሠሪና ሠራተኛ አዋጅ መሰረት ማህበራት እንዲደራጁና ሠራተኞች መብትና ጥቅማቸው እንዲጠበቅ ማድረግ",
      "የሠራተኛውን አቅም በትምህርትና ሥልጠና ማጎልበት",
      "በአለም አቀፍ የሠራተኛ ንቅናቄ ውስጥ ንቁ ተሳትፎ ማድረግ"
    ]
  },
  structure: {
    title: {
      en: "Federation Structure",
      am: "የፌዴሬሽኑ አወቃቀር"
    },
    departments: {
      en: [
        "President",
        "Secretary General, Administration & Finance",
        "Industry Relation and Union Organization",
        "Social Affairs and Foreign Relations",
        "Education and Training",
        "Audit Committee Chairperson",
        "Audit Secretary",
        "Audit Member"
      ],
      am: [
        "ፕሬዝዳንት",
        "ዋና ፀሀፊ አስ/ፋይናንስ",
        "ኢንዱስትሪ ግንኙነትና ማህበራት ማደራጃ",
        "ማህበራዊ ጉዳይ እና ውጭ ግንኙነት",
        "ትምህርትና ስልጠና",
        "ኦዲት ኮሚቴ ሰብሳቢ",
        "ኦዲት ፀሃፊ",
        "ኦዲት አባል"
      ]
    }
  },
  stakeholders: {
    title: {
      en: "Key Stakeholders",
      am: "ባለድርሻ አካላት"
    },
    list: {
      en: [
        "Affiliated basic unions",
        "Peer Federations",
        "The Confederation of Ethiopian Trade Unions (CETU)",
        "Federal, Regional and City Administrations",
        "Employers, Investors, and Government Institutions",
        "International Trade Unions and Civil Societies"
      ],
      am: [
        "በፌዴሬሽኑ ሥር የተደራጁ አባል ማኅበራት",
        "አቻ ፌዴሬሽኖች",
        "የኢትዮጰያ ሠራተኛ ማኅበራት ኮንፌዴሬሽን",
        "የፌዴራል የክልልና የከተማ አስተዳደር",
        "የአሠሪዎች፣ ባለሀብቶች፣ የመንግስት ተቋማት",
        "ዓለም አቀፍ ሠራተኛ ማኅበራቶች እና የሲቪክ ማህበራት"
      ]
    }
  },
  executives: [
    {
      id: "exec-1",
      name: { en: "Abathun Takele", am: "አባትሁን ታከለ" },
      position: { en: "President", am: "ፕሬዝዳንት" }
    },
    {
      id: "exec-2",
      name: { en: "Ayalnesh Hassan", am: "አያልነሽ ሀሰን" },
      position: { en: "Secretary General, Administration & Finance", am: "ዋና ፀሀፊ አስ/ፋይናንስ" }
    },
    {
      id: "exec-3",
      name: { en: "Mulualem Eshete", am: "ሙሉአለም እሸቴ" },
      position: { en: "Industry Relation and Union Organization", am: "ኢንዱስትሪ ግንኙነትና ማህበራት ማደራጃ" }
    },
    {
      id: "exec-4",
      name: { en: "Sindu W/Hana", am: "ስንዱ ወ/ሃና" },
      position: { en: "Social Affairs and Foreign Relations", am: "ማህበራዊ ጉዳይ እና ውጭ ግንኙነት" }
    },
    {
      id: "exec-5",
      name: { en: "To be appointed", am: "ለጊዜው ያልተሟላ" },
      position: { en: "Education and Training", am: "ትምህርትና ስልጠና" }
    },
    {
      id: "exec-6",
      name: { en: "Abdulaziz Mohamed", am: "አብዱልአዚዝ ሞሀመድ" },
      position: { en: "Chairman of the Audit Committee", am: "ኦዲት ኮሚቴ ሰብሳቢ" }
    },
    {
      id: "exec-7",
      name: { en: "Tegegn Darge", am: "ተገኝ ዳርጌ" },
      position: { en: "Audit Secretary", am: "ኦዲት ፀሃፊ" }
    },
    {
      id: "exec-8",
      name: { en: "To be appointed", am: "ለጊዜው ያልተሟላ" },
      position: { en: "Audit Member", am: "ኦዲት አባል" }
    }
  ],
  otherExperts: []
};

export const defaultHomeContent: HomeContent = {
  hero: {
    title: {
      en: "Ethiopian Transport and Communication Workers Union Industrial Federation",
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
    phone: import.meta.env.VITE_CONTACT_PHONE1 || "+251-11-XXX-XXXX",
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

