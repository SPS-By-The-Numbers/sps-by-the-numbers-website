export type SchoolInfo = {
  school: string;
  school_code: number;
  is_district_office: boolean;
};

export type SchoolMap = Record<number, Array<SchoolInfo>>;

const ALL_SCHOOLS: SchoolMap = {
  1109: [
    {
      school_code: 1217,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3075,
      school: "Washtucna Elementary/High School",
      is_district_office: false,
    },
  ],
  1122: [
    {
      school_code: 1261,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3142,
      school: "Benge Elementary",
      is_district_office: false,
    },
  ],
  1147: [
    {
      school_code: 1044,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2902,
      school: "Lutacaga Elementary",
      is_district_office: false,
    },
    {
      school_code: 2961,
      school: "Hiawatha Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3015,
      school: "Othello High School",
      is_district_office: false,
    },
    {
      school_code: 3471,
      school: "McFarland Middle School",
      is_district_office: false,
    },
    {
      school_code: 3730,
      school: "Scootney Springs Elementary",
      is_district_office: false,
    },
    {
      school_code: 5285,
      school: "Wahitis Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5367,
      school: "Desert Oasis High School",
      is_district_office: false,
    },
    {
      school_code: 5528,
      school: "Early Childhood Center",
      is_district_office: false,
    },
    {
      school_code: 5634,
      school: "Open Door Re-Engagement",
      is_district_office: false,
    },
  ],
  1158: [
    {
      school_code: 1188,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2903,
      school: "Lind-Ritzville High School",
      is_district_office: false,
    },
    {
      school_code: 3421,
      school: "Lind Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5293,
      school: "Lind-Ritzville Middle School",
      is_district_office: false,
    },
  ],
  1160: [
    {
      school_code: 1154,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2132,
      school: "Ritzville High School",
      is_district_office: false,
    },
    {
      school_code: 2719,
      school: "Ritzville Grade School",
      is_district_office: false,
    },
    {
      school_code: 5303,
      school: "Lind Ritzville Middle School",
      is_district_office: false,
    },
  ],
  2250: [
    {
      school_code: 1043,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1617,
      school: "Educational Opportunity Center",
      is_district_office: false,
    },
    {
      school_code: 2299,
      school: "Charles Francis Adams High School",
      is_district_office: false,
    },
    {
      school_code: 2501,
      school: "Lincoln Middle School",
      is_district_office: false,
    },
    {
      school_code: 2823,
      school: "Parkway Elementary",
      is_district_office: false,
    },
    {
      school_code: 2962,
      school: "Grantham Elementary",
      is_district_office: false,
    },
    {
      school_code: 3266,
      school: "Highland Elementary",
      is_district_office: false,
    },
    {
      school_code: 3616,
      school: "Special Services",
      is_district_office: false,
    },
    {
      school_code: 4384,
      school: "Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 5413,
      school: "Educational Opportunity Center Reengagement",
      is_district_office: false,
    },
    {
      school_code: 5644,
      school: "Clarkston Home Alliance",
      is_district_office: false,
    },
  ],
  2420: [
    {
      school_code: 1214,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2434,
      school: "Asotin Jr Sr High - Asotin",
      is_district_office: false,
    },
    {
      school_code: 2507,
      school: "Asotin Elementary - Asotin",
      is_district_office: false,
    },
  ],
  3017: [
    {
      school_code: 1017,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1884,
      school: "Legacy High School",
      is_district_office: false,
    },
    {
      school_code: 1941,
      school: "Mid-Columbia Parent Partnership",
      is_district_office: false,
    },
    {
      school_code: 2000,
      school: "Keewaydin Discovery Center",
      is_district_office: false,
    },
    {
      school_code: 2824,
      school: "Eastgate Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2825,
      school: "Westgate Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2826,
      school: "Kennewick High School",
      is_district_office: false,
    },
    {
      school_code: 3077,
      school: "Hawthorne Elementary School - Kennewick",
      is_district_office: false,
    },
    {
      school_code: 3144,
      school: "Washington Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3267,
      school: "Highlands Middle School",
      is_district_office: false,
    },
    {
      school_code: 3315,
      school: "Edison Elementary School - Kennewick",
      is_district_office: false,
    },
    {
      school_code: 3369,
      school: "Vista Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3472,
      school: "Park Middle School",
      is_district_office: false,
    },
    {
      school_code: 3731,
      school: "Kamiakin High School",
      is_district_office: false,
    },
    {
      school_code: 4007,
      school: "Benton/Franklin Juvenile Justice Center",
      is_district_office: false,
    },
    {
      school_code: 4028,
      school: "Desert Hills Middle School",
      is_district_office: false,
    },
    {
      school_code: 4072,
      school: "Canyon View Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4073,
      school: "Southgate Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4118,
      school: "Tri-Tech Skills Center",
      is_district_office: false,
    },
    {
      school_code: 4136,
      school: "Sunset View Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4181,
      school: "Lincoln Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4202,
      school: "Cascade Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4418,
      school: "Amistad Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4429,
      school: "Horse Heaven Hills Middle School",
      is_district_office: false,
    },
    {
      school_code: 4446,
      school: "Ridge View Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4484,
      school: "Southridge High School",
      is_district_office: false,
    },
    {
      school_code: 5106,
      school: "Phoenix High School",
      is_district_office: false,
    },
    {
      school_code: 5220,
      school: "Cottonwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 5235,
      school: "Benton County Jail",
      is_district_office: false,
    },
    {
      school_code: 5438,
      school: "Sage Crest Elementary",
      is_district_office: false,
    },
    {
      school_code: 5439,
      school: "Chinook Middle School",
      is_district_office: false,
    },
    {
      school_code: 5520,
      school: "Amon Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 5521,
      school: "Fuerza Elementary",
      is_district_office: false,
    },
    {
      school_code: 5727,
      school: "Endeavor High School",
      is_district_office: false,
    },
  ],
  3050: [
    {
      school_code: 1262,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2133,
      school: "Paterson Elementary School",
      is_district_office: false,
    },
  ],
  3052: [
    {
      school_code: 1126,
      school: "District Office -  Kiona",
      is_district_office: true,
    },
    {
      school_code: 2904,
      school: "Kiona-Benton City High School",
      is_district_office: false,
    },
    {
      school_code: 3961,
      school: "Kiona-Benton City Middle School",
      is_district_office: false,
    },
    {
      school_code: 5719,
      school: "Kiona-Benton City Elementary",
      is_district_office: false,
    },
  ],
  3053: [
    {
      school_code: 1153,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2367,
      school: "River View High School",
      is_district_office: false,
    },
    {
      school_code: 3078,
      school: "Finley Elementary",
      is_district_office: false,
    },
    {
      school_code: 4031,
      school: "Finley Middle School",
      is_district_office: false,
    },
  ],
  3116: [
    {
      school_code: 1087,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1728,
      school: "Prosser Falls Education Center",
      is_district_office: false,
    },
    {
      school_code: 2195,
      school: "Keene-Riverview Elementary",
      is_district_office: false,
    },
    {
      school_code: 2508,
      school: "Prosser High School",
      is_district_office: false,
    },
    {
      school_code: 2905,
      school: "Whitstran Elementary",
      is_district_office: false,
    },
    {
      school_code: 2906,
      school: "Housel Middle School",
      is_district_office: false,
    },
    {
      school_code: 3316,
      school: "Prosser Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 5537,
      school: "Prosser Opportunity Academy",
      is_district_office: false,
    },
  ],
  3400: [
    {
      school_code: 1018,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2001,
      school: "Special Programs",
      is_district_office: false,
    },
    {
      school_code: 2642,
      school: "Jefferson Elementary",
      is_district_office: false,
    },
    {
      school_code: 2656,
      school: "Marcus Whitman Elementary",
      is_district_office: false,
    },
    {
      school_code: 2657,
      school: "Lewis & Clark Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2721,
      school: "Carmichael Middle School",
      is_district_office: false,
    },
    {
      school_code: 2785,
      school: "Chief Joseph Middle School",
      is_district_office: false,
    },
    {
      school_code: 2786,
      school: "Jason Lee Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3469,
      school: "Twin Rivers Group Home",
      is_district_office: false,
    },
    {
      school_code: 3511,
      school: "Richland High School",
      is_district_office: false,
    },
    {
      school_code: 3732,
      school: "Sacajawea Elementary",
      is_district_office: false,
    },
    {
      school_code: 3833,
      school: "Hanford High School",
      is_district_office: false,
    },
    {
      school_code: 3926,
      school: "Enterprise Middle School",
      is_district_office: false,
    },
    {
      school_code: 4059,
      school: "Tapteal Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4060,
      school: "Badger Mountain Elementary",
      is_district_office: false,
    },
    {
      school_code: 4295,
      school: "Rivers Edge High School",
      is_district_office: false,
    },
    {
      school_code: 4543,
      school: "William Wiley Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5092,
      school: "White Bluffs Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5165,
      school: "Three Rivers Home Link",
      is_district_office: false,
    },
    {
      school_code: 5419,
      school: "Orchard Elementary",
      is_district_office: false,
    },
    {
      school_code: 5493,
      school: "Leona Libby Middle School",
      is_district_office: false,
    },
    {
      school_code: 5526,
      school: "Richland School District Early Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5689,
      school: "Pacific Crest Online Academy",
      is_district_office: false,
    },
    {
      school_code: 5732,
      school: "Desert Sky Elementary",
      is_district_office: false,
    },
  ],
  4019: [
    {
      school_code: 1191,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2623,
      school: "Manson High School",
      is_district_office: false,
    },
    {
      school_code: 2196,
      school: "Manson Elementary",
      is_district_office: false,
    },
    {
      school_code: 5286,
      school: "Manson Middle School",
      is_district_office: false,
    },
    {
      school_code: 5739,
      school: "Manson Early Learning Center",
      is_district_office: false,
    },
  ],
  4069: [
    {
      school_code: 1263,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2265,
      school: "Stehekin Elementary",
      is_district_office: false,
    },
  ],
  4127: [
    {
      school_code: 1192,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2688,
      school: "Paul Rumburg Elementary",
      is_district_office: false,
    },
    {
      school_code: 3317,
      school: "Entiat Middle and High School",
      is_district_office: false,
    },
  ],
  4129: [
    {
      school_code: 1133,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1675,
      school: "Lake Chelan Preschool",
      is_district_office: false,
    },
    {
      school_code: 1940,
      school: "Chelan School of Innovation",
      is_district_office: false,
    },
    {
      school_code: 2317,
      school: "Chelan Middle School",
      is_district_office: false,
    },
    {
      school_code: 2689,
      school: "Morgen Owings Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3861,
      school: "Holden Village Community School",
      is_district_office: false,
    },
    {
      school_code: 4260,
      school: "Chelan High School",
      is_district_office: false,
    },
  ],
  4222: [
    {
      school_code: 1094,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2315,
      school: "CASHMERE MIDDLE SCHOOL",
      is_district_office: false,
    },
    {
      school_code: 2787,
      school: "VALE ELEMENTARY SCHOOL",
      is_district_office: false,
    },
    {
      school_code: 3268,
      school: "CASHMERE HIGH SCHOOL",
      is_district_office: false,
    },
  ],
  4228: [
    {
      school_code: 1132,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2760,
      school: "Peshastin Dryden Elementary",
      is_district_office: false,
    },
    {
      school_code: 2827,
      school: "Alpine Lakes Elementary",
      is_district_office: false,
    },
    {
      school_code: 3564,
      school: "Cascade High School",
      is_district_office: false,
    },
    {
      school_code: 4403,
      school: "Icicle River Middle School",
      is_district_office: false,
    },
    {
      school_code: 4566,
      school: "Beaver Valley School",
      is_district_office: false,
    },
    {
      school_code: 5418,
      school: "Cascade Home-Link",
      is_district_office: false,
    },
    {
      school_code: 5640,
      school: "Kodiak Virtual Academy",
      is_district_office: false,
    },
  ],
  4246: [
    {
      school_code: 1021,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1612,
      school: "Skill Source",
      is_district_office: false,
    },
    {
      school_code: 1613,
      school: "Westside High School",
      is_district_office: false,
    },
    {
      school_code: 1742,
      school: "Valley Academy Of Learning",
      is_district_office: false,
    },
    {
      school_code: 1802,
      school: "Chelan County Juvenile Detention Center",
      is_district_office: false,
    },
    {
      school_code: 2134,
      school: "Wenatchee High School",
      is_district_office: false,
    },
    {
      school_code: 2279,
      school: "Lewis And Clark Elementary Sch",
      is_district_office: false,
    },
    {
      school_code: 2301,
      school: "Columbia Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2347,
      school: "Mission View Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2907,
      school: "Washington Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3208,
      school: "Sunnyslope Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3209,
      school: "Abraham Lincoln Elementary",
      is_district_office: false,
    },
    {
      school_code: 3210,
      school: "Pioneer Middle School",
      is_district_office: false,
    },
    {
      school_code: 3269,
      school: "Castlerock Early Learning Center",
      is_district_office: false,
    },
    {
      school_code: 3370,
      school: "Orchard Middle School",
      is_district_office: false,
    },
    {
      school_code: 4105,
      school: "Wenatchee Valley Technical Skills Center",
      is_district_office: false,
    },
    {
      school_code: 4423,
      school: "John Newbery Elementary",
      is_district_office: false,
    },
    {
      school_code: 4432,
      school: "Foothills Middle School",
      is_district_office: false,
    },
    {
      school_code: 5316,
      school: "Open Doors  Re-Engagement Wenatchee",
      is_district_office: false,
    },
    {
      school_code: 5569,
      school: "Valley Academy of Learning K-8",
      is_district_office: false,
    },
    {
      school_code: 5637,
      school: "Wenatchee Internet Academy",
      is_district_office: false,
    },
  ],
  4901: [
    {
      school_code: 1362,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5686,
      school: "Pinnacles Prep Charter School",
      is_district_office: false,
    },
  ],
  5121: [
    {
      school_code: 1036,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1715,
      school: "Parents As Partners",
      is_district_office: false,
    },
    {
      school_code: 1897,
      school: "Special Education",
      is_district_office: false,
    },
    {
      school_code: 2368,
      school: "Jefferson Elementary",
      is_district_office: false,
    },
    {
      school_code: 2908,
      school: "Port Angeles High School",
      is_district_office: false,
    },
    {
      school_code: 2909,
      school: "Franklin Elementary",
      is_district_office: false,
    },
    {
      school_code: 3079,
      school: "Hamilton Elementary",
      is_district_office: false,
    },
    {
      school_code: 3318,
      school: "Stevens Middle School",
      is_district_office: false,
    },
    {
      school_code: 4003,
      school: "Lincoln High School",
      is_district_office: false,
    },
    {
      school_code: 4175,
      school: "North Olympic Peninsula Skills Center",
      is_district_office: false,
    },
    {
      school_code: 4494,
      school: "Dry Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 5115,
      school: "Roosevelt Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5611,
      school: "Seaview Academy",
      is_district_office: false,
    },
  ],
  5313: [
    {
      school_code: 1224,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3473,
      school: "Crescent School",
      is_district_office: false,
    },
    {
      school_code: 5030,
      school: "HomeConnection",
      is_district_office: false,
    },
  ],
  5323: [
    {
      school_code: 1117,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1708,
      school: "Olympic Peninsula Academy",
      is_district_office: false,
    },
    {
      school_code: 2471,
      school: "Sequim Senior High",
      is_district_office: false,
    },
    {
      school_code: 2722,
      school: "Helen Haller Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4378,
      school: "Greywolf Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4519,
      school: "Sequim Middle School",
      is_district_office: false,
    },
    {
      school_code: 5613,
      school: "Dungeness Virtual School",
      is_district_office: false,
    },
  ],
  5401: [
    {
      school_code: 1174,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1787,
      school: "Cape Flattery Preschool",
      is_district_office: false,
    },
    {
      school_code: 2594,
      school: "Neah Bay Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3145,
      school: "Neah Bay Junior/ Senior High School",
      is_district_office: false,
    },
    {
      school_code: 3422,
      school: "Clallam Bay High & Elementary",
      is_district_office: false,
    },
  ],
  5402: [
    {
      school_code: 1118,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1500,
      school: "Forks Alternative School",
      is_district_office: true,
    },
    {
      school_code: 1671,
      school: "District Run Home School",
      is_district_office: false,
    },
    {
      school_code: 2349,
      school: "Forks Junior-Senior High School",
      is_district_office: false,
    },
    {
      school_code: 2609,
      school: "Forks Middle School",
      is_district_office: false,
    },
    {
      school_code: 3737,
      school: "Forks Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5071,
      school: "Insight School of Washington",
      is_district_office: false,
    },
    {
      school_code: 5363,
      school: "Forks Intermediate School",
      is_district_office: false,
    },
    {
      school_code: 5529,
      school: "Insight School of WA Open Doors Program",
      is_district_office: false,
    },
  ],
  5903: [
    {
      school_code: 1338,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5430,
      school: "Quileute Tribal School",
      is_district_office: false,
    },
  ],
  6037: [
    {
      school_code: 1014,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1574,
      school: "Fir Grove Childrens Center",
      is_district_office: false,
    },
    {
      school_code: 1689,
      school: "Vancouver School of Arts and Academics",
      is_district_office: false,
    },
    {
      school_code: 1738,
      school: "Gate Program",
      is_district_office: false,
    },
    {
      school_code: 2179,
      school: "Fort Vancouver High School",
      is_district_office: false,
    },
    {
      school_code: 2318,
      school: "Lincoln Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2610,
      school: "Hough Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2636,
      school: "Early Childhood Education Center",
      is_district_office: false,
    },
    {
      school_code: 2637,
      school: "Fruit Valley Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2643,
      school: "Harney Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2644,
      school: "Peter S Ogden Elementary",
      is_district_office: false,
    },
    {
      school_code: 2690,
      school: "Hazel Dell Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2723,
      school: "Minnehaha Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2828,
      school: "Walnut Grove Elementary",
      is_district_office: false,
    },
    {
      school_code: 2964,
      school: "Salmon Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 3016,
      school: "Sarah J Anderson Elementary",
      is_district_office: false,
    },
    {
      school_code: 3017,
      school: "Lake Shore Elementary",
      is_district_office: false,
    },
    {
      school_code: 3080,
      school: "Benjamin Franklin Elementary",
      is_district_office: false,
    },
    {
      school_code: 3081,
      school: "Hudson's Bay High School",
      is_district_office: false,
    },
    {
      school_code: 3146,
      school: "Mcloughlin Middle School",
      is_district_office: false,
    },
    {
      school_code: 3423,
      school: "Columbia River High",
      is_district_office: false,
    },
    {
      school_code: 3424,
      school: "George C Marshall Elementary",
      is_district_office: false,
    },
    {
      school_code: 3543,
      school: "Jason Lee Middle School",
      is_district_office: false,
    },
    {
      school_code: 3556,
      school: "Vancouver Home Connection",
      is_district_office: false,
    },
    {
      school_code: 3565,
      school: "Washington Elementary",
      is_district_office: false,
    },
    {
      school_code: 3733,
      school: "Dwight D Eisenhower Elementary",
      is_district_office: false,
    },
    {
      school_code: 3734,
      school: "Martin Luther King Elementary",
      is_district_office: false,
    },
    {
      school_code: 3735,
      school: "Harry S Truman Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3902,
      school: "Gaiser Middle School",
      is_district_office: false,
    },
    {
      school_code: 3932,
      school: "Lewis and Clark High School",
      is_district_office: false,
    },
    {
      school_code: 4034,
      school: "Sacajawea Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4075,
      school: "Felida Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4405,
      school: "Chinook Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4406,
      school: "Alki Middle School",
      is_district_office: false,
    },
    {
      school_code: 4410,
      school: "Roosevelt Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4503,
      school: "Discovery Middle School",
      is_district_office: false,
    },
    {
      school_code: 4504,
      school: "Skyview High School",
      is_district_office: false,
    },
    {
      school_code: 4524,
      school: "Vancouver Alternative Programs",
      is_district_office: false,
    },
    {
      school_code: 4591,
      school: "Jefferson Middle School",
      is_district_office: false,
    },
    {
      school_code: 5149,
      school: "Vancouver Virtual Learning Academy",
      is_district_office: false,
    },
    {
      school_code: 5258,
      school: "Vancouver Contracted Programs",
      is_district_office: false,
    },
    {
      school_code: 5271,
      school: "Vancouver iTech Preparatory",
      is_district_office: false,
    },
    {
      school_code: 5342,
      school: "Open Doors Vancouver",
      is_district_office: false,
    },
    {
      school_code: 5713,
      school: "Vancouver Alternative Programs",
      is_district_office: false,
    },
    {
      school_code: 5716,
      school: "Vancouver Intensive Communications Center",
      is_district_office: false,
    },
    {
      school_code: 5744,
      school: "Ruth Bader Ginsburg Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5745,
      school: "Vancouver Innovation Technology and Arts Elementary",
      is_district_office: false,
    },
  ],
  6098: [
    {
      school_code: 1255,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3319,
      school: "Hockinson Middle School",
      is_district_office: false,
    },
    {
      school_code: 4568,
      school: "Hockinson High School",
      is_district_office: false,
    },
    {
      school_code: 5311,
      school: "Hockinson Heights Elementary School",
      is_district_office: false,
    },
  ],
  6101: [
    {
      school_code: 1165,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2558,
      school: "La Center Elementary",
      is_district_office: false,
    },
    {
      school_code: 3371,
      school: "La Center Middle School",
      is_district_office: false,
    },
    {
      school_code: 4431,
      school: "La Center High School",
      is_district_office: false,
    },
    {
      school_code: 5326,
      school: "La Center Home School Academy",
      is_district_office: false,
    },
  ],
  6103: [
    {
      school_code: 1264,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2484,
      school: "Green Mountain School",
      is_district_office: false,
    },
  ],
  6112: [
    {
      school_code: 1108,
      school: "District Office -  Washougal School District 112",
      is_district_office: true,
    },
    {
      school_code: 1528,
      school: "Excelsior High School",
      is_district_office: false,
    },
    {
      school_code: 1899,
      school: "Washougal Special Services",
      is_district_office: false,
    },
    {
      school_code: 2509,
      school: "Hathaway Elementary",
      is_district_office: false,
    },
    {
      school_code: 2911,
      school: "Gause Elementary",
      is_district_office: false,
    },
    {
      school_code: 3147,
      school: "Washougal High School",
      is_district_office: false,
    },
    {
      school_code: 3270,
      school: "Cape Horn Skye Elementary",
      is_district_office: false,
    },
    {
      school_code: 4207,
      school: "Jemtegaard Middle School",
      is_district_office: false,
    },
    {
      school_code: 4549,
      school: "Canyon Creek Middle School",
      is_district_office: false,
    },
    {
      school_code: 5494,
      school: "Columbia River Gorge Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5615,
      school: "Washougal Learning Academy",
      is_district_office: false,
    },
  ],
  6114: [
    {
      school_code: 1030,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1530,
      school: "Early Childhood Center",
      is_district_office: false,
    },
    {
      school_code: 1646,
      school: "49th Street Academy",
      is_district_office: false,
    },
    {
      school_code: 1801,
      school: "iQ Academy Washington",
      is_district_office: false,
    },
    {
      school_code: 1926,
      school: "Home Choice Academy",
      is_district_office: false,
    },
    {
      school_code: 2724,
      school: "Evergreen High School",
      is_district_office: false,
    },
    {
      school_code: 2829,
      school: "Mill Plain Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2912,
      school: "Orchards Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3148,
      school: "Ellsworth Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3149,
      school: "Sifton Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3320,
      school: "Covington Middle School",
      is_district_office: false,
    },
    {
      school_code: 3618,
      school: "Marrion Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3736,
      school: "Burton Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3785,
      school: "Cascade Middle School",
      is_district_office: false,
    },
    {
      school_code: 3822,
      school: "Crestline Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3823,
      school: "Silver Star Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3970,
      school: "Sunset Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3971,
      school: "Fircrest Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3994,
      school: "Image Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3995,
      school: "Riverview Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4042,
      school: "Legacy High School",
      is_district_office: false,
    },
    {
      school_code: 4051,
      school: "Wyeast Middle School",
      is_district_office: false,
    },
    {
      school_code: 4162,
      school: "Mountain View High School",
      is_district_office: false,
    },
    {
      school_code: 4163,
      school: "Hearthwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4203,
      school: "Cascadia Technical Academy Skills Center",
      is_district_office: false,
    },
    {
      school_code: 4209,
      school: "Pacific Middle School",
      is_district_office: false,
    },
    {
      school_code: 4299,
      school: "Burnt Bridge Creek Elementary Sch",
      is_district_office: false,
    },
    {
      school_code: 4380,
      school: "Harmony Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4445,
      school: "Pioneer Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4498,
      school: "Frontier Middle School",
      is_district_office: false,
    },
    {
      school_code: 4499,
      school: "Fishers Landing Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4523,
      school: "Heritage High School",
      is_district_office: false,
    },
    {
      school_code: 4560,
      school: "Illahee Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4561,
      school: "Shahala Middle School",
      is_district_office: false,
    },
    {
      school_code: 4579,
      school: "York Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4587,
      school: "Columbia Valley Elementary",
      is_district_office: false,
    },
    {
      school_code: 5111,
      school: "Union High School",
      is_district_office: false,
    },
    {
      school_code: 5136,
      school: "Endeavour Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5310,
      school: "Henrietta Lacks Health and Bioscience High School",
      is_district_office: false,
    },
    {
      school_code: 5435,
      school: "Open Doors Evergreen",
      is_district_office: false,
    },
    {
      school_code: 5535,
      school: "Cascadia Technical Academy ALE",
      is_district_office: false,
    },
    {
      school_code: 5612,
      school: "Emerald Elementary School",
      is_district_office: false,
    },
  ],
  6117: [
    {
      school_code: 1082,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2725,
      school: "Helen Baller Elem",
      is_district_office: false,
    },
    {
      school_code: 3474,
      school: "Lacamas Lake Elementary",
      is_district_office: false,
    },
    {
      school_code: 4182,
      school: "Dorothy Fox",
      is_district_office: false,
    },
    {
      school_code: 4508,
      school: "Skyridge Middle School",
      is_district_office: false,
    },
    {
      school_code: 4563,
      school: "Prune Hill Elem",
      is_district_office: false,
    },
    {
      school_code: 4567,
      school: "Camas High School",
      is_district_office: false,
    },
    {
      school_code: 5054,
      school: "Liberty Middle School",
      is_district_office: false,
    },
    {
      school_code: 5055,
      school: "Papermaker Preschool",
      is_district_office: false,
    },
    {
      school_code: 5104,
      school: "Hayes Freedom High School",
      is_district_office: false,
    },
    {
      school_code: 5158,
      school: "Grass Valley Elementary",
      is_district_office: false,
    },
    {
      school_code: 5309,
      school: "Woodburn Elementary",
      is_district_office: false,
    },
    {
      school_code: 5532,
      school: "Camas School District Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5533,
      school: "Discovery High School",
      is_district_office: false,
    },
    {
      school_code: 5534,
      school: "Odyssey Middle School",
      is_district_office: false,
    },
    {
      school_code: 5573,
      school: "The Heights Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5702,
      school: "Camas Connect Academy",
      is_district_office: false,
    },
  ],
  6119: [
    {
      school_code: 1063,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1597,
      school: "Homelink Schools",
      is_district_office: false,
    },
    {
      school_code: 1836,
      school: "CAM Academy",
      is_district_office: false,
    },
    {
      school_code: 1875,
      school: "Homelink River",
      is_district_office: false,
    },
    {
      school_code: 2415,
      school: "Battle Ground High School",
      is_district_office: false,
    },
    {
      school_code: 2671,
      school: "Amboy Middle School",
      is_district_office: false,
    },
    {
      school_code: 2910,
      school: "Yacolt Primary",
      is_district_office: false,
    },
    {
      school_code: 3018,
      school: "Glenwood Heights Primary",
      is_district_office: false,
    },
    {
      school_code: 3545,
      school: "Laurin Middle School",
      is_district_office: false,
    },
    {
      school_code: 3996,
      school: "Pleasant Valley Primary",
      is_district_office: false,
    },
    {
      school_code: 3997,
      school: "Pleasant Valley Middle",
      is_district_office: false,
    },
    {
      school_code: 4104,
      school: "Prairie High School",
      is_district_office: false,
    },
    {
      school_code: 4108,
      school: "Preschool Infant Other",
      is_district_office: false,
    },
    {
      school_code: 4144,
      school: "Maple Grove Primary",
      is_district_office: false,
    },
    {
      school_code: 4352,
      school: "Captain Strong",
      is_district_office: false,
    },
    {
      school_code: 4450,
      school: "Summit View High School",
      is_district_office: false,
    },
    {
      school_code: 5089,
      school: "Daybreak Middle",
      is_district_office: false,
    },
    {
      school_code: 5090,
      school: "Daybreak Primary",
      is_district_office: false,
    },
    {
      school_code: 5131,
      school: "Tukes Valley Middle School",
      is_district_office: false,
    },
    {
      school_code: 5132,
      school: "Tukes Valley Primary",
      is_district_office: false,
    },
    {
      school_code: 5133,
      school: "Chief Umtuch Middle",
      is_district_office: false,
    },
    {
      school_code: 5291,
      school: "Maple Grove K-8",
      is_district_office: false,
    },
    {
      school_code: 5360,
      school: "Open Doors Battle Ground",
      is_district_office: false,
    },
    {
      school_code: 5382,
      school: "Summit View Middle School",
      is_district_office: false,
    },
    {
      school_code: 5502,
      school: "Daybreak Youth Services",
      is_district_office: false,
    },
    {
      school_code: 5749,
      school: "Battle Ground Virtual Academy",
      is_district_office: false,
    },
  ],
  6122: [
    {
      school_code: 1109,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2390,
      school: "Ridgefield High School",
      is_district_office: false,
    },
    {
      school_code: 3321,
      school: "South Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 3786,
      school: "Union Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 3891,
      school: "View Ridge Middle School",
      is_district_office: false,
    },
    {
      school_code: 5518,
      school: "Sunset Ridge Intermediate School",
      is_district_office: false,
    },
    {
      school_code: 5558,
      school: "Ridgefield Early Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5690,
      school: "Wisdom Ridge Academy",
      is_district_office: false,
    },
  ],
  6701: [
    {
      school_code: 5467,
      school: "ESA 112 Special Ed Co-Op",
      is_district_office: false,
    },
  ],
  6801: [
    {
      school_code: 3294,
      school: "Cowlitz County Youth Services Center",
      is_district_office: false,
    },
    {
      school_code: 5290,
      school: "Clark County Juvenile Detention School",
      is_district_office: false,
    },
    {
      school_code: 5398,
      school: "ESD 112 Open Doors Reengagement",
      is_district_office: false,
    },
  ],
  6901: [
    {
      school_code: 1365,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5755,
      school: "Rooted School Washington",
      is_district_office: false,
    },
  ],
  7002: [
    {
      school_code: 1124,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2302,
      school: "Dayton High School",
      is_district_office: false,
    },
    {
      school_code: 2830,
      school: "Dayton Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4011,
      school: "Dayton Middle School",
      is_district_office: false,
    },
    {
      school_code: 5617,
      school: "Dayton School District Alternative Program",
      is_district_office: false,
    },
  ],
  7035: [
    {
      school_code: 1265,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2135,
      school: "Starbuck School",
      is_district_office: false,
    },
    {
      school_code: 5696,
      school: "Virtual Preparatory Academy",
      is_district_office: false,
    },
  ],
  8122: [
    {
      school_code: 1031,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2319,
      school: "Kessler Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2369,
      school: "Columbia Valley Garden Elem Schl",
      is_district_office: false,
    },
    {
      school_code: 2370,
      school: "Saint Helens Elementary",
      is_district_office: false,
    },
    {
      school_code: 2416,
      school: "R A Long High School",
      is_district_office: false,
    },
    {
      school_code: 2665,
      school: "Broadway Learning Center",
      is_district_office: false,
    },
    {
      school_code: 2726,
      school: "Olympic Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2831,
      school: "Monticello Middle School",
      is_district_office: false,
    },
    {
      school_code: 2914,
      school: "Northlake Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3019,
      school: "Robert Gray Elementary",
      is_district_office: false,
    },
    {
      school_code: 3151,
      school: "Mark Morris High School",
      is_district_office: false,
    },
    {
      school_code: 3211,
      school: "Columbia Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 3475,
      school: "Cascade Middle School",
      is_district_office: false,
    },
    {
      school_code: 3658,
      school: "Mint Valley Elementary",
      is_district_office: false,
    },
    {
      school_code: 3913,
      school: "Longview School District Special Services",
      is_district_office: false,
    },
    {
      school_code: 4574,
      school: "Mt. Solo Middle School",
      is_district_office: false,
    },
    {
      school_code: 5312,
      school: "Discovery High School",
      is_district_office: false,
    },
    {
      school_code: 5400,
      school: "Discovery High School-Achieve",
      is_district_office: false,
    },
    {
      school_code: 5614,
      school: "Longview Virtual Academy",
      is_district_office: false,
    },
  ],
  8130: [
    {
      school_code: 1199,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2560,
      school: "Toutle Lake High School",
      is_district_office: false,
    },
    {
      school_code: 4264,
      school: "Toutle Lake Elementary",
      is_district_office: false,
    },
  ],
  8401: [
    {
      school_code: 1110,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2281,
      school: "Castle Rock High School",
      is_district_office: false,
    },
    {
      school_code: 2762,
      school: "Castle Rock Elementary",
      is_district_office: false,
    },
    {
      school_code: 3969,
      school: "Castle Rock Middle School",
      is_district_office: false,
    },
    {
      school_code: 5666,
      school: "Rocket Virtual Academy",
      is_district_office: false,
    },
  ],
  8402: [
    {
      school_code: 1140,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2561,
      school: "Kalama Middle School",
      is_district_office: false,
    },
    {
      school_code: 2915,
      school: "Kalama Elem School",
      is_district_office: false,
    },
    {
      school_code: 5545,
      school: "Kalama High School",
      is_district_office: false,
    },
  ],
  8404: [
    {
      school_code: 1111,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1795,
      school: "TEAM High School",
      is_district_office: false,
    },
    {
      school_code: 3513,
      school: "Yale Elementary",
      is_district_office: false,
    },
    {
      school_code: 3546,
      school: "Woodland High School",
      is_district_office: false,
    },
    {
      school_code: 5246,
      school: "Lewis River Academy",
      is_district_office: false,
    },
    {
      school_code: 5407,
      school: "Woodland Primary School",
      is_district_office: false,
    },
    {
      school_code: 5408,
      school: "Woodland Intermediate School",
      is_district_office: false,
    },
    {
      school_code: 5409,
      school: "Woodland Middle School",
      is_district_office: false,
    },
    {
      school_code: 5599,
      school: "Columbia Elementary",
      is_district_office: false,
    },
    {
      school_code: 5600,
      school: "North Fork Elementary School",
      is_district_office: false,
    },
  ],
  8458: [
    {
      school_code: 1032,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1934,
      school: "Loowit High School",
      is_district_office: false,
    },
    {
      school_code: 2266,
      school: "Kelso High School",
      is_district_office: false,
    },
    {
      school_code: 2624,
      school: "Wallace Elementary",
      is_district_office: false,
    },
    {
      school_code: 2596,
      school: "Rose Valley Elementary",
      is_district_office: false,
    },
    {
      school_code: 2691,
      school: "Catlin Elementary",
      is_district_office: false,
    },
    {
      school_code: 2913,
      school: "Carrolls Elementary",
      is_district_office: false,
    },
    {
      school_code: 2916,
      school: "Huntington Middle School",
      is_district_office: false,
    },
    {
      school_code: 3082,
      school: "Butler Acres Elementary",
      is_district_office: false,
    },
    {
      school_code: 3322,
      school: "Coweeman Middle School",
      is_district_office: false,
    },
    {
      school_code: 3323,
      school: "Barnes Elementary",
      is_district_office: false,
    },
    {
      school_code: 3578,
      school: "Beacon Hill Elementary",
      is_district_office: false,
    },
    {
      school_code: 5076,
      school: "Special Education",
      is_district_office: false,
    },
    {
      school_code: 5194,
      school: "Kelso Virtual Academy",
      is_district_office: false,
    },
    {
      school_code: 5547,
      school: "Kelso Goal Oriented Learning Design",
      is_district_office: false,
    },
    {
      school_code: 5675,
      school: "Lexington Elementary",
      is_district_office: false,
    },
  ],
  9013: [
    {
      school_code: 1267,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2666,
      school: "Orondo Elementary and Middle School",
      is_district_office: false,
    },
  ],
  9075: [
    {
      school_code: 1193,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1900,
      school: "Bridgeport Aurora High School",
      is_district_office: false,
    },
    {
      school_code: 2562,
      school: "Bridgeport Elementary",
      is_district_office: false,
    },
    {
      school_code: 2788,
      school: "Bridgeport High School",
      is_district_office: false,
    },
    {
      school_code: 4213,
      school: "Bridgeport Middle School",
      is_district_office: false,
    },
  ],
  9102: [
    {
      school_code: 1268,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2502,
      school: "Palisades Elementary School",
      is_district_office: false,
    },
  ],
  9206: [
    {
      school_code: 1050,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2563,
      school: "Rock Island Elementary",
      is_district_office: false,
    },
    {
      school_code: 2727,
      school: "Eastmont Senior High",
      is_district_office: false,
    },
    {
      school_code: 2966,
      school: "Grant Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2986,
      school: "Canyon View Group Home",
      is_district_office: false,
    },
    {
      school_code: 3083,
      school: "Lee Elementary",
      is_district_office: false,
    },
    {
      school_code: 3212,
      school: "Kenroy Elementary",
      is_district_office: false,
    },
    {
      school_code: 3372,
      school: "Eastmont Junior High",
      is_district_office: false,
    },
    {
      school_code: 3659,
      school: "Cascade Elementary",
      is_district_office: false,
    },
    {
      school_code: 4095,
      school: "Sterling School",
      is_district_office: false,
    },
    {
      school_code: 4590,
      school: "Clovis Point",
      is_district_office: false,
    },
    {
      school_code: 5130,
      school: "Eastmont Preschools",
      is_district_office: false,
    },
    {
      school_code: 5228,
      school: "Eastmont Columbia Virtual Academy",
      is_district_office: false,
    },
    {
      school_code: 5668,
      school: "Eastmont Academy",
      is_district_office: false,
    },
    {
      school_code: 5700,
      school: "Clovis Point Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5701,
      school: "Sterling Jr. High School",
      is_district_office: false,
    },
  ],
  9207: [
    {
      school_code: 1240,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2233,
      school: "Mansfield Elem and High School",
      is_district_office: false,
    },
  ],
  9209: [
    {
      school_code: 1194,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2161,
      school: "Waterville Elementary",
      is_district_office: false,
    },
    {
      school_code: 2162,
      school: "Waterville High School",
      is_district_office: false,
    },
  ],
  10003: [
    {
      school_code: 1269,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2602,
      school: "Keller Elementary School",
      is_district_office: false,
    },
  ],
  10050: [
    {
      school_code: 1226,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1921,
      school: "Curlew Parent Partner",
      is_district_office: false,
    },
    {
      school_code: 2006,
      school: "Curlew Elem & High School",
      is_district_office: false,
    },
    {
      school_code: 5530,
      school: "Ferry County Open Doors",
      is_district_office: false,
    },
  ],
  10065: [
    {
      school_code: 1271,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2136,
      school: "Orient Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5155,
      school: "Columbia Virtual Academy-Orient",
      is_district_office: false,
    },
  ],
  10070: [
    {
      school_code: 1227,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2603,
      school: "Inchelium High School",
      is_district_office: false,
    },
    {
      school_code: 4214,
      school: "Inchelium Middle School",
      is_district_office: false,
    },
    {
      school_code: 4215,
      school: "Inchelium Elementary School",
      is_district_office: false,
    },
  ],
  10309: [
    {
      school_code: 1176,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1898,
      school: "Republic Parent Partner",
      is_district_office: false,
    },
    {
      school_code: 2789,
      school: "Republic Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3559,
      school: "Republic Junior High",
      is_district_office: false,
    },
    {
      school_code: 3579,
      school: "Republic Senior High School",
      is_district_office: false,
    },
  ],
  11001: [
    {
      school_code: 1019,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1970,
      school: "Pasco Early Childhood",
      is_district_office: false,
    },
    {
      school_code: 2267,
      school: "Mcloughlin Middle School",
      is_district_office: false,
    },
    {
      school_code: 2790,
      school: "Longfellow Elementary",
      is_district_office: false,
    },
    {
      school_code: 2917,
      school: "Pasco Senior High School",
      is_district_office: false,
    },
    {
      school_code: 2967,
      school: "Emerson Elementary",
      is_district_office: false,
    },
    {
      school_code: 3085,
      school: "Mark Twain Elementary",
      is_district_office: false,
    },
    {
      school_code: 3324,
      school: "Stevens Middle School",
      is_district_office: false,
    },
    {
      school_code: 3425,
      school: "Edwin Markham Elementary",
      is_district_office: false,
    },
    {
      school_code: 3515,
      school: "Robert Frost Elementary",
      is_district_office: false,
    },
    {
      school_code: 3912,
      school: "New Horizons High School",
      is_district_office: false,
    },
    {
      school_code: 4041,
      school: "Ruth Livingston Elementary",
      is_district_office: false,
    },
    {
      school_code: 4155,
      school: "James McGee Elementary",
      is_district_office: false,
    },
    {
      school_code: 4526,
      school: "Whittier Elementary",
      is_district_office: false,
    },
    {
      school_code: 4555,
      school: "Rowena Chess Elementary",
      is_district_office: false,
    },
    {
      school_code: 4564,
      school: "Ellen Ochoa Middle School",
      is_district_office: false,
    },
    {
      school_code: 4595,
      school: "Maya Angelou Elementary",
      is_district_office: false,
    },
    {
      school_code: 5020,
      school: "Virgie Robinson Elementary",
      is_district_office: false,
    },
    {
      school_code: 5164,
      school: "Chiawana High School",
      is_district_office: false,
    },
    {
      school_code: 5345,
      school: "Rosalind Franklin STEM Elementary",
      is_district_office: false,
    },
    {
      school_code: 5391,
      school: "Barbara McClintock STEM Elementary",
      is_district_office: false,
    },
    {
      school_code: 5392,
      school: "Captain Gray STEM Elementary",
      is_district_office: false,
    },
    {
      school_code: 5393,
      school: "Internet Pasco Academy of Learning",
      is_district_office: false,
    },
    {
      school_code: 5394,
      school: "Marie Curie STEM Elementary",
      is_district_office: false,
    },
    {
      school_code: 5483,
      school: "Pasco Early Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5556,
      school: "Three Rivers Elementary",
      is_district_office: false,
    },
    {
      school_code: 5596,
      school: "Soar to Success",
      is_district_office: false,
    },
    {
      school_code: 5623,
      school: "Columbia River Elementary",
      is_district_office: false,
    },
    {
      school_code: 5624,
      school: "Ray Reynolds Middle School",
      is_district_office: false,
    },
    {
      school_code: 5711,
      school: "Pasco Innovative Experiences and e-Learning",
      is_district_office: false,
    },
  ],
  11051: [
    {
      school_code: 1088,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1754,
      school: "Palouse Junction High School",
      is_district_office: false,
    },
    {
      school_code: 1889,
      school: "Connell Preschool",
      is_district_office: false,
    },
    {
      school_code: 2198,
      school: "Robert L Olds Junior High School",
      is_district_office: false,
    },
    {
      school_code: 2918,
      school: "Connell Elem",
      is_district_office: false,
    },
    {
      school_code: 3086,
      school: "Mesa Elem",
      is_district_office: false,
    },
    {
      school_code: 3272,
      school: "Connell High School",
      is_district_office: false,
    },
    {
      school_code: 3325,
      school: "Basin City Elem",
      is_district_office: false,
    },
    {
      school_code: 5499,
      school: "CRCC-Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5653,
      school: "North Franklin Virtual Academy",
      is_district_office: false,
    },
  ],
  11054: [
    {
      school_code: 1272,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2007,
      school: "Star Elem School",
      is_district_office: false,
    },
  ],
  11056: [
    {
      school_code: 1234,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3214,
      school: "Kahlotus Elem & High",
      is_district_office: false,
    },
  ],
  11801: [
    {
      school_code: 5403,
      school: "Ugrad \u2013 ESD123 Re-Engagement Program",
      is_district_office: false,
    },
  ],
  12110: [
    {
      school_code: 1125,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2241,
      school: "Pomeroy Jr Sr High School",
      is_district_office: false,
    },
    {
      school_code: 3087,
      school: "Pomeroy Elementary School",
      is_district_office: false,
    },
  ],
  13073: [
    {
      school_code: 1273,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1835,
      school: "Sentinel Tech Alt School",
      is_district_office: false,
    },
    {
      school_code: 1981,
      school: "Developmental Pre-School",
      is_district_office: false,
    },
    {
      school_code: 1982,
      school: "Birth to 3 Years",
      is_district_office: false,
    },
    {
      school_code: 3152,
      school: "Mattawa Elementary",
      is_district_office: false,
    },
    {
      school_code: 4222,
      school: "Morris Schott Elementary",
      is_district_office: false,
    },
    {
      school_code: 4254,
      school: "Wahluke High School",
      is_district_office: false,
    },
    {
      school_code: 4490,
      school: "Saddle Mountain Elementary",
      is_district_office: false,
    },
    {
      school_code: 5120,
      school: "Mattawa Elementary Pre-School",
      is_district_office: false,
    },
    {
      school_code: 5144,
      school: "Wahluke Junior High",
      is_district_office: false,
    },
  ],
  13144: [
    {
      school_code: 1089,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1506,
      school: "Quincy High Tech High",
      is_district_office: false,
    },
    {
      school_code: 2510,
      school: "Quincy Middle School",
      is_district_office: false,
    },
    {
      school_code: 2919,
      school: "Pioneer Elementary",
      is_district_office: false,
    },
    {
      school_code: 3020,
      school: "Mountain View Elementary",
      is_district_office: false,
    },
    {
      school_code: 3088,
      school: "Quincy High School",
      is_district_office: false,
    },
    {
      school_code: 3426,
      school: "George Elementary",
      is_district_office: false,
    },
    {
      school_code: 4536,
      school: "Monument Elementary",
      is_district_office: false,
    },
    {
      school_code: 5585,
      school: "Ancient Lakes Elementary",
      is_district_office: false,
    },
    {
      school_code: 5648,
      school: "Quincy Innovation Academy",
      is_district_office: false,
    },
    {
      school_code: 5650,
      school: "Quincy Innovation Academy Big Picture",
      is_district_office: false,
    },
  ],
  13146: [
    {
      school_code: 1156,
      school:
        "District Office -  Warden Joint Consolidated School District 146",
      is_district_office: true,
    },
    {
      school_code: 2792,
      school: "Warden Elementary",
      is_district_office: false,
    },
    {
      school_code: 3273,
      school: "Warden High School",
      is_district_office: false,
    },
    {
      school_code: 3909,
      school: "Warden Middle School",
      is_district_office: false,
    },
  ],
  13151: [
    {
      school_code: 1218,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2304,
      school: "Coulee City MS",
      is_district_office: false,
    },
    {
      school_code: 2693,
      school: "Coulee City Elementary",
      is_district_office: false,
    },
    {
      school_code: 2968,
      school: "Almira Coulee Hartline High School",
      is_district_office: false,
    },
  ],
  13156: [
    {
      school_code: 1189,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1518,
      school: "RISE Academy",
      is_district_office: false,
    },
    {
      school_code: 2694,
      school: "Soap Lake Elementary",
      is_district_office: false,
    },
    {
      school_code: 3089,
      school: "Soap Lake Middle & High School",
      is_district_office: false,
    },
  ],
  13160: [
    {
      school_code: 1127,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3090,
      school: "Red Rock Elementary",
      is_district_office: false,
    },
    {
      school_code: 3516,
      school: "Royal High School",
      is_district_office: false,
    },
    {
      school_code: 3620,
      school: "Royal Middle School",
      is_district_office: false,
    },
    {
      school_code: 5388,
      school: "Royal Intermediate School",
      is_district_office: false,
    },
  ],
  13161: [
    {
      school_code: 1020,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2673,
      school: "Frontier Middle School",
      is_district_office: false,
    },
    {
      school_code: 2832,
      school: "Peninsula Elementary",
      is_district_office: false,
    },
    {
      school_code: 2833,
      school: "Knolls Vista Elementary",
      is_district_office: false,
    },
    {
      school_code: 2969,
      school: "Lakeview Terrace Elementary",
      is_district_office: false,
    },
    {
      school_code: 2970,
      school: "Midway Elementary",
      is_district_office: false,
    },
    {
      school_code: 3021,
      school: "Larson Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 3022,
      school: "Chief Moses Middle School",
      is_district_office: false,
    },
    {
      school_code: 3091,
      school: "Garden Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 3153,
      school: "Longview Elementary",
      is_district_office: false,
    },
    {
      school_code: 3215,
      school: "Moses Lake High School",
      is_district_office: false,
    },
    {
      school_code: 3779,
      school: "North Elementary",
      is_district_office: false,
    },
    {
      school_code: 5173,
      school: "Sage Point Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5251,
      school: "Park Orchard Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5273,
      school: "Columbia Basin Technical Skills Center",
      is_district_office: false,
    },
    {
      school_code: 5323,
      school: "Skill Source Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5354,
      school: "Endeavor Middle School",
      is_district_office: false,
    },
    {
      school_code: 5652,
      school: "Moses Lake Early Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5679,
      school: "Digital Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5680,
      school: "Vicki I. Groff Elementary",
      is_district_office: false,
    },
    {
      school_code: 5726,
      school: "Vanguard Academy",
      is_district_office: false,
    },
  ],
  13165: [
    {
      school_code: 1090,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1971,
      school: "Sage Hills High School",
      is_district_office: false,
    },
    {
      school_code: 2695,
      school: "Parkway School",
      is_district_office: false,
    },
    {
      school_code: 2793,
      school: "Columbia Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 2920,
      school: "Ephrata High School",
      is_district_office: false,
    },
    {
      school_code: 3092,
      school: "Grant Elementary",
      is_district_office: false,
    },
    {
      school_code: 3340,
      school: "Grant Co Detention Ctr",
      is_district_office: false,
    },
    {
      school_code: 3373,
      school: "Ephrata Middle School",
      is_district_office: false,
    },
    {
      school_code: 4229,
      school: "Beezley Springs Elementary",
      is_district_office: false,
    },
    {
      school_code: 5497,
      school: "Sage Hills Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5553,
      school: "Sage Hills ECEAP",
      is_district_office: false,
    },
  ],
  13167: [
    {
      school_code: 1236,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2472,
      school: "Wilson Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 2473,
      school: "Wilson Creek High",
      is_district_office: false,
    },
  ],
  13301: [
    {
      school_code: 1155,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2801,
      school: "Lake Roosevelt Jr/Sr High School",
      is_district_office: false,
    },
    {
      school_code: 2802,
      school: "Lake Roosevelt Elementary",
      is_district_office: false,
    },
    {
      school_code: 5336,
      school: "Lake Roosevelt Alternative School",
      is_district_office: false,
    },
  ],
  14005: [
    {
      school_code: 1033,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2305,
      school: "Miller Junior High",
      is_district_office: false,
    },
    {
      school_code: 2449,
      school: "McDermoth Elementary",
      is_district_office: false,
    },
    {
      school_code: 2763,
      school: "Robert Gray Elementary",
      is_district_office: false,
    },
    {
      school_code: 2834,
      school: "A J West Elementary",
      is_district_office: false,
    },
    {
      school_code: 2971,
      school: "Stevens Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3154,
      school: "Hopkins Elementary",
      is_district_office: false,
    },
    {
      school_code: 3216,
      school: "Central Park Elementary",
      is_district_office: false,
    },
    {
      school_code: 3476,
      school: "J M Weatherwax High School",
      is_district_office: false,
    },
    {
      school_code: 3857,
      school: "Harbor High School",
      is_district_office: false,
    },
    {
      school_code: 4267,
      school: "Grays Harbor Juvenile Detention",
      is_district_office: false,
    },
    {
      school_code: 5208,
      school: "Twin Harbors - A Branch of New Market Skills Center",
      is_district_office: false,
    },
    {
      school_code: 5514,
      school: "Grays Harbor Academy",
      is_district_office: false,
    },
    {
      school_code: 5663,
      school: "Harbor Open Doors",
      is_district_office: false,
    },
  ],
  14028: [
    {
      school_code: 1064,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2268,
      school: "Emerson Elementary",
      is_district_office: false,
    },
    {
      school_code: 2391,
      school: "Hoquiam Middle School",
      is_district_office: false,
    },
    {
      school_code: 2972,
      school: "Central Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3621,
      school: "Lincoln Elementary",
      is_district_office: false,
    },
    {
      school_code: 3622,
      school: "Hoquiam High School",
      is_district_office: false,
    },
    {
      school_code: 5191,
      school: "Hoquiam Homelink School",
      is_district_office: false,
    },
  ],
  14064: [
    {
      school_code: 1168,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2728,
      school: "North Beach Senior High School",
      is_district_office: false,
    },
    {
      school_code: 3155,
      school: "Pacific Beach Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3787,
      school: "Ocean Shores Elementary",
      is_district_office: false,
    },
    {
      school_code: 3788,
      school: "North Beach Junior High School",
      is_district_office: false,
    },
  ],
  14065: [
    {
      school_code: 1274,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2835,
      school: "Mccleary Elem",
      is_district_office: false,
    },
  ],
  14066: [
    {
      school_code: 1113,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2180,
      school: "Montesano Jr-Sr High",
      is_district_office: false,
    },
    {
      school_code: 3374,
      school: "Simpson Avenue Elementary",
      is_district_office: false,
    },
    {
      school_code: 3661,
      school: "Beacon Avenue Elementary School",
      is_district_office: false,
    },
  ],
  14068: [
    {
      school_code: 1114,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1629,
      school: "East Grays Harbor High School",
      is_district_office: false,
    },
    {
      school_code: 2137,
      school: "Elma High School",
      is_district_office: false,
    },
    {
      school_code: 3217,
      school: "Elma Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4245,
      school: "Elma Middle School",
      is_district_office: false,
    },
    {
      school_code: 5416,
      school: "East Grays Harbor Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5715,
      school: "Eagle Virtual Sky Acadmey",
      is_district_office: false,
    },
  ],
  14077: [
    {
      school_code: 1275,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3580,
      school: "Taholah High School",
      is_district_office: false,
    },
    {
      school_code: 5032,
      school: "Taholah Elementary & Middle School",
      is_district_office: false,
    },
  ],
  14097: [
    {
      school_code: 1201,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2921,
      school: "Lake Quinault School",
      is_district_office: false,
    },
    {
      school_code: 2973,
      school: "Lake Quinault High School",
      is_district_office: false,
    },
  ],
  14099: [
    {
      school_code: 1276,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3326,
      school: "Cosmopolis Elementary School",
      is_district_office: false,
    },
  ],
  14104: [
    {
      school_code: 1277,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2010,
      school: "Satsop Elementary",
      is_district_office: false,
    },
  ],
  14117: [
    {
      school_code: 1247,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3375,
      school: "Wishkah Valley Elementary/High School",
      is_district_office: false,
    },
  ],
  14172: [
    {
      school_code: 5708,
      school: "Ocosta ALE",
      is_district_office: false,
    },
    {
      school_code: 1143,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3024,
      school: "Ocosta Junior - Senior High",
      is_district_office: false,
    },
    {
      school_code: 3025,
      school: "Ocosta Elementary School",
      is_district_office: false,
    },
  ],
  14400: [
    {
      school_code: 1202,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2283,
      school: "Oakville High School",
      is_district_office: false,
    },
    {
      school_code: 2922,
      school: "Oakville Elementary",
      is_district_office: false,
    },
    {
      school_code: 5584,
      school: "Oakville Homelink",
      is_district_office: false,
    },
    {
      school_code: 5594,
      school: "Oakville Preschool",
      is_district_office: false,
    },
  ],
  15201: [
    {
      school_code: 1051,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1758,
      school: "Homeconnection",
      is_district_office: false,
    },
    {
      school_code: 2696,
      school: "Oak Harbor Elementary",
      is_district_office: false,
    },
    {
      school_code: 2974,
      school: "Oak Harbor High School",
      is_district_office: false,
    },
    {
      school_code: 3274,
      school: "Oak Harbor Intermediate School",
      is_district_office: false,
    },
    {
      school_code: 3377,
      school: "Crescent Harbor Elem",
      is_district_office: false,
    },
    {
      school_code: 3477,
      school: "Broadview Elementary",
      is_district_office: false,
    },
    {
      school_code: 3566,
      school: "Olympic View Elem",
      is_district_office: false,
    },
    {
      school_code: 3662,
      school: "Special Education",
      is_district_office: false,
    },
    {
      school_code: 3939,
      school: "North Whidbey Middle School",
      is_district_office: false,
    },
    {
      school_code: 4328,
      school: "Hillcrest Elementary",
      is_district_office: false,
    },
    {
      school_code: 5343,
      school: "iGrad Academy",
      is_district_office: false,
    },
    {
      school_code: 5626,
      school: "Oak Harbor Virtual Academy",
      is_district_office: false,
    },
  ],
  15204: [
    {
      school_code: 1161,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2625,
      school: "Coupeville High School",
      is_district_office: false,
    },
    {
      school_code: 3664,
      school: "Coupeville Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4004,
      school: "Coupeville Middle School",
      is_district_office: false,
    },
    {
      school_code: 5034,
      school: "Toddler Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5059,
      school: "Island Juvenile Detention Education Program",
      is_district_office: false,
    },
    {
      school_code: 5234,
      school: "ICCF Ed Program",
      is_district_office: false,
    },
    {
      school_code: 5412,
      school: "Open Den",
      is_district_office: false,
    },
  ],
  15206: [
    {
      school_code: 1137,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1682,
      school: "South Whidbey Academy",
      is_district_office: false,
    },
    {
      school_code: 1683,
      school: "South Whidbey Special Services",
      is_district_office: false,
    },
    {
      school_code: 2511,
      school: "South Whidbey Middle",
      is_district_office: false,
    },
    {
      school_code: 4149,
      school: "South Whidbey High School",
      is_district_office: false,
    },
    {
      school_code: 4321,
      school: "South Whidbey Elementary",
      is_district_office: false,
    },
  ],
  16020: [
    {
      school_code: 1278,
      school: "District Office -  Queets",
      is_district_office: true,
    },
    {
      school_code: 2491,
      school: "Queets-Clearwater Elementary - Queets",
      is_district_office: false,
    },
  ],
  16046: [
    {
      school_code: 1279,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2836,
      school: "Brinnon Elementary",
      is_district_office: false,
    },
  ],
  16048: [
    {
      school_code: 1225,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2474,
      school: "Quilcene High And Elementary",
      is_district_office: false,
    },
    {
      school_code: 5081,
      school: "Crossroads Community School",
      is_district_office: false,
    },
    {
      school_code: 5236,
      school: "PEARL",
      is_district_office: false,
    },
  ],
  16049: [
    {
      school_code: 1175,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1724,
      school: "PI Program",
      is_district_office: false,
    },
    {
      school_code: 2697,
      school: "Chimacum Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3275,
      school: "Chimacum Junior/Senior High School",
      is_district_office: false,
    },
    {
      school_code: 4261,
      school: "Chimacum Middle School",
      is_district_office: false,
    },
    {
      school_code: 4552,
      school: "Chimacum Creek Primary School",
      is_district_office: false,
    },
    {
      school_code: 5397,
      school: "Open Doors Reengagement Program",
      is_district_office: false,
    },
  ],
  16050: [
    {
      school_code: 1119,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1798,
      school: "OCEAN",
      is_district_office: false,
    },
    {
      school_code: 2503,
      school: "Port Townsend High School",
      is_district_office: false,
    },
    {
      school_code: 3094,
      school: "Salish Coast Elementary",
      is_district_office: false,
    },
    {
      school_code: 4475,
      school: "Blue Heron Middle School",
      is_district_office: false,
    },
  ],
  17001: [
    {
      school_code: 1002,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1547,
      school: "Middle College High School",
      is_district_office: false,
    },
    {
      school_code: 1579,
      school: "Tops K-8 School",
      is_district_office: false,
    },
    {
      school_code: 1596,
      school: "Seattle World School",
      is_district_office: false,
    },
    {
      school_code: 1620,
      school: "Pathfinder K-8 School",
      is_district_office: false,
    },
    {
      school_code: 1635,
      school: "Interagency Programs",
      is_district_office: false,
    },
    {
      school_code: 1751,
      school: "Cascade Parent Partnership Program",
      is_district_office: false,
    },
    {
      school_code: 1796,
      school: "Salmon Bay K-8 School",
      is_district_office: false,
    },
    {
      school_code: 1856,
      school: "The Center School",
      is_district_office: false,
    },
    {
      school_code: 2061,
      school: "Green Lake Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2063,
      school: "John Hay Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2069,
      school: "Madrona K-5 School",
      is_district_office: false,
    },
    {
      school_code: 2070,
      school: "Beacon Hill International School",
      is_district_office: false,
    },
    {
      school_code: 2080,
      school: "Stevens Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2081,
      school: "John Stanford International School",
      is_district_office: false,
    },
    {
      school_code: 2089,
      school: "Martin Luther King Jr. Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2090,
      school: "Frantz Coe Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2092,
      school: "Whittier Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2118,
      school: "Emerson Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2120,
      school: "Rising Star Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2121,
      school: "Leschi Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2123,
      school: "Greenwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2138,
      school: "Adams Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2139,
      school: "Gatewood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2141,
      school: "Thurgood Marshall Elementary",
      is_district_office: false,
    },
    {
      school_code: 2142,
      school: "West Woodland Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2143,
      school: "John Muir Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2181,
      school: "Alki Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2182,
      school: "Franklin High School",
      is_district_office: false,
    },
    {
      school_code: 2183,
      school: "Lawton Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2199,
      school: "Concord International School",
      is_district_office: false,
    },
    {
      school_code: 2201,
      school: "McGilvra Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2209,
      school: "Broadview-Thomson K-8 School",
      is_district_office: false,
    },
    {
      school_code: 2220,
      school: "Ballard High School",
      is_district_office: false,
    },
    {
      school_code: 2234,
      school: "West Seattle High School",
      is_district_office: false,
    },
    {
      school_code: 2256,
      school: "Olympic View Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2269,
      school: "Highland Park Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2285,
      school: "Roosevelt High School",
      is_district_office: false,
    },
    {
      school_code: 2306,
      school: "Garfield High School",
      is_district_office: false,
    },
    {
      school_code: 2307,
      school: "Bailey Gatzert Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2321,
      school: "Dunlap Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2322,
      school: "Montlake Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2353,
      school: "Maple Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2371,
      school: "Hamilton International Middle School",
      is_district_office: false,
    },
    {
      school_code: 2372,
      school: "Bryant Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2392,
      school: "Cleveland High School STEM",
      is_district_office: false,
    },
    {
      school_code: 2435,
      school: "Madison Middle School",
      is_district_office: false,
    },
    {
      school_code: 2437,
      school: "Laurelhurst Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2450,
      school: "Daniel Bagley Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2462,
      school: "Loyal Heights Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2645,
      school: "West Seattle Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2667,
      school: "View Ridge Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2729,
      school: "Eckstein Middle School",
      is_district_office: false,
    },
    {
      school_code: 2730,
      school: "Arbor Heights Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2733,
      school: "Lafayette Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2838,
      school: "Catharine Blaine K-8 School",
      is_district_office: false,
    },
    {
      school_code: 2839,
      school: "David T. Denny International Middle School",
      is_district_office: false,
    },
    {
      school_code: 2975,
      school: "John Rogers Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2976,
      school: "Olympic Hills Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2977,
      school: "Viewlands Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3026,
      school: "Wedgwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3027,
      school: "Northgate Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3028,
      school: "Sacajawea Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3095,
      school: "Mercer International Middle School",
      is_district_office: false,
    },
    {
      school_code: 3096,
      school: "Chief Sealth International High School",
      is_district_office: false,
    },
    {
      school_code: 3157,
      school: "Roxhill Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3218,
      school: "North Beach Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3276,
      school: "Ingraham High School",
      is_district_office: false,
    },
    {
      school_code: 3277,
      school: "Whitman Middle School",
      is_district_office: false,
    },
    {
      school_code: 3327,
      school: "Rainier Beach High School",
      is_district_office: false,
    },
    {
      school_code: 3378,
      school: "Graham Hill Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3380,
      school: "Rainier View Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3429,
      school: "Genesee Hill Elementary",
      is_district_office: false,
    },
    {
      school_code: 3478,
      school: "Kimball Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3479,
      school: "Nathan Hale High School",
      is_district_office: false,
    },
    {
      school_code: 3496,
      school: "Interagency Detention School",
      is_district_office: false,
    },
    {
      school_code: 3517,
      school: "McClure Middle School",
      is_district_office: false,
    },
    {
      school_code: 3518,
      school: "Fairmount Park Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3581,
      school: "Wing Luke Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3665,
      school: "Sanislo Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3714,
      school: "Lowell Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3717,
      school: "B F Day Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3774,
      school: "Aki Kurose Middle School",
      is_district_office: false,
    },
    {
      school_code: 3778,
      school: "South Lake High School",
      is_district_office: false,
    },
    {
      school_code: 3803,
      school: "Dearborn Park International School",
      is_district_office: false,
    },
    {
      school_code: 3868,
      school: "Nova High School",
      is_district_office: false,
    },
    {
      school_code: 3874,
      school: "Licton Springs K-8",
      is_district_office: false,
    },
    {
      school_code: 3974,
      school: "Thornton Creek Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4064,
      school: "Washington Middle School",
      is_district_office: false,
    },
    {
      school_code: 4065,
      school: "Orca K-8 School",
      is_district_office: false,
    },
    {
      school_code: 4218,
      school: "South Shore PK-8 School",
      is_district_office: false,
    },
    {
      school_code: 4248,
      school: "Hawthorne Elementary School - Seattle",
      is_district_office: false,
    },
    {
      school_code: 4263,
      school: "Residential Consortium",
      is_district_office: false,
    },
    {
      school_code: 4277,
      school: "Hutch School",
      is_district_office: false,
    },
    {
      school_code: 5046,
      school: "Private School Services",
      is_district_office: false,
    },
    {
      school_code: 5048,
      school: "Birth to 3 Contracts",
      is_district_office: false,
    },
    {
      school_code: 5175,
      school: "Hazel Wolf K-8",
      is_district_office: false,
    },
    {
      school_code: 5203,
      school: "McDonald International School",
      is_district_office: false,
    },
    {
      school_code: 5204,
      school: "Queen Anne Elementary",
      is_district_office: false,
    },
    {
      school_code: 5205,
      school: "Sand Point Elementary",
      is_district_office: false,
    },
    {
      school_code: 5260,
      school: "Seattle Skills Center",
      is_district_office: false,
    },
    {
      school_code: 5276,
      school: "Louisa Boren STEM K-8",
      is_district_office: false,
    },
    {
      school_code: 5292,
      school: "Cascadia Elementary",
      is_district_office: false,
    },
    {
      school_code: 5351,
      school: "Jane Addams Middle School",
      is_district_office: false,
    },
    {
      school_code: 5405,
      school: "Interagency Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5406,
      school: "Bridges Transition",
      is_district_office: false,
    },
    {
      school_code: 5485,
      school: "Meany Middle School",
      is_district_office: false,
    },
    {
      school_code: 5486,
      school: "Robert Eagle Staff Middle School",
      is_district_office: false,
    },
    {
      school_code: 5487,
      school: "Cedar Park Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5488,
      school: "Decatur Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5565,
      school: "Magnolia Elementary",
      is_district_office: false,
    },
    {
      school_code: 5566,
      school: "Lincoln High School",
      is_district_office: false,
    },
    {
      school_code: 5649,
      school: "Cascade Parent Partnership Program",
      is_district_office: false,
    },
  ],
  17210: [
    {
      school_code: 1008,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1759,
      school: "Internet Academy",
      is_district_office: false,
    },
    {
      school_code: 1789,
      school: "Federal Way Public Academy",
      is_district_office: false,
    },
    {
      school_code: 1950,
      school: "Employment Transition Program",
      is_district_office: false,
    },
    {
      school_code: 1951,
      school: "Support School",
      is_district_office: false,
    },
    {
      school_code: 2417,
      school: "Federal Way High School",
      is_district_office: false,
    },
    {
      school_code: 2841,
      school: "Lakeland Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3159,
      school: "Mirror Lake Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3160,
      school: "Star Lake Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3328,
      school: "Woodmont K-8 School",
      is_district_office: false,
    },
    {
      school_code: 3329,
      school: "Panther Lake Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3381,
      school: "Lakota Middle School",
      is_district_office: false,
    },
    {
      school_code: 3431,
      school: "Totem Middle School",
      is_district_office: false,
    },
    {
      school_code: 3432,
      school: "Olympic View Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3519,
      school: "Adelaide Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3547,
      school: "Camelot Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3567,
      school: "Sunnycrest Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3568,
      school: "Lake Grove Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3582,
      school: "Valhalla Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3583,
      school: "Wildwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3584,
      school: "Thomas Jefferson High School",
      is_district_office: false,
    },
    {
      school_code: 3625,
      school: "Nautilus K-8 School",
      is_district_office: false,
    },
    {
      school_code: 3626,
      school: "Sacajawea Middle School",
      is_district_office: false,
    },
    {
      school_code: 3627,
      school: "Mark Twain Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3628,
      school: "Twin Lakes Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3700,
      school: "Brigadoon Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3701,
      school: "Kilo Middle School",
      is_district_office: false,
    },
    {
      school_code: 3738,
      school: "Lake Dolloff Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3766,
      school: "Decatur High School",
      is_district_office: false,
    },
    {
      school_code: 3898,
      school: "Illahee Middle School",
      is_district_office: false,
    },
    {
      school_code: 4343,
      school: "Silver Lake Elementary School - Federal Way",
      is_district_office: false,
    },
    {
      school_code: 4374,
      school: "Sherwood Forest Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4422,
      school: "Rainier View Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4426,
      school: "Green Gables Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4456,
      school: "Saghalie Middle School",
      is_district_office: false,
    },
    {
      school_code: 4470,
      school: "Enterprise Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4480,
      school: "Meredith Hill Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4570,
      school: "Todd Beamer High School",
      is_district_office: false,
    },
    {
      school_code: 5029,
      school: "Sequoyah Middle School",
      is_district_office: false,
    },
    {
      school_code: 5107,
      school: "Federal Way Running Start Home School",
      is_district_office: false,
    },
    {
      school_code: 5138,
      school: "Technology Access Foundation Academy",
      is_district_office: false,
    },
    {
      school_code: 5163,
      school: "Career Academy at Truman High School",
      is_district_office: false,
    },
    {
      school_code: 5218,
      school: "Federal Way Public School ECEAP",
      is_district_office: false,
    },
    {
      school_code: 5219,
      school: "Federal Way Public Schools Headstart",
      is_district_office: false,
    },
    {
      school_code: 5255,
      school: "Gateway to College",
      is_district_office: false,
    },
    {
      school_code: 5279,
      school: "Birth to Three Development Center",
      is_district_office: false,
    },
    {
      school_code: 5280,
      school: "Dynamic Family Services",
      is_district_office: false,
    },
    {
      school_code: 5348,
      school: "Open Doors Youth Reengagement (1418)",
      is_district_office: false,
    },
    {
      school_code: 5473,
      school: "TAFA at Saghalie",
      is_district_office: false,
    },
  ],
  17216: [
    {
      school_code: 1077,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1523,
      school: "Special Ed School",
      is_district_office: false,
    },
    {
      school_code: 2980,
      school: "Byron Kibler Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3330,
      school: "Enumclaw Sr High School",
      is_district_office: false,
    },
    {
      school_code: 3430,
      school: "Black Diamond Elementary",
      is_district_office: false,
    },
    {
      school_code: 3585,
      school: "Westwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3739,
      school: "Southwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4210,
      school: "Enumclaw Middle School",
      is_district_office: false,
    },
    {
      school_code: 4289,
      school: "Sunrise Elementary",
      is_district_office: false,
    },
    {
      school_code: 4550,
      school: "Thunder Mountain Middle School",
      is_district_office: false,
    },
    {
      school_code: 5491,
      school: "JJ Smith Elementary",
      is_district_office: false,
    },
  ],
  17400: [
    {
      school_code: 1024,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2981,
      school: "Lakeridge Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3029,
      school: "Mercer Island High School",
      is_district_office: false,
    },
    {
      school_code: 3162,
      school: "Island Park Elementary",
      is_district_office: false,
    },
    {
      school_code: 3219,
      school: "Islander Middle School",
      is_district_office: false,
    },
    {
      school_code: 3433,
      school: "West Mercer Elementary",
      is_district_office: false,
    },
    {
      school_code: 5447,
      school: "Northwood Elementary School",
      is_district_office: false,
    },
  ],
  17401: [
    {
      school_code: 1003,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1539,
      school: "CHOICE Academy",
      is_district_office: false,
    },
    {
      school_code: 1972,
      school: "New Start",
      is_district_office: false,
    },
    {
      school_code: 1973,
      school: "Satellite High School",
      is_district_office: false,
    },
    {
      school_code: 1998,
      school: "Head Start",
      is_district_office: false,
    },
    {
      school_code: 2144,
      school: "Mount View Elementary",
      is_district_office: false,
    },
    {
      school_code: 2270,
      school: "Puget Sound Skills Center",
      is_district_office: false,
    },
    {
      school_code: 2325,
      school: "Highline High School",
      is_district_office: false,
    },
    {
      school_code: 2418,
      school: "Des Moines Elementary",
      is_district_office: false,
    },
    {
      school_code: 2639,
      school: "White Center Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 2699,
      school: "Hazel Valley Elementary",
      is_district_office: false,
    },
    {
      school_code: 2734,
      school: "McMicken Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 2765,
      school: "Beverly Park Elem at Glendale",
      is_district_office: false,
    },
    {
      school_code: 2842,
      school: "Shorewood Elementary",
      is_district_office: false,
    },
    {
      school_code: 2844,
      school: "Gregory Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 2926,
      school: "Cedarhurst Elementary",
      is_district_office: false,
    },
    {
      school_code: 2927,
      school: "Sylvester Middle School",
      is_district_office: false,
    },
    {
      school_code: 2982,
      school: "Bow Lake Elementary",
      is_district_office: false,
    },
    {
      school_code: 2983,
      school: "North Hill Elementary",
      is_district_office: false,
    },
    {
      school_code: 2984,
      school: "Midway Elementary",
      is_district_office: false,
    },
    {
      school_code: 3032,
      school: "Southern Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 3097,
      school: "Marvista Elementary",
      is_district_office: false,
    },
    {
      school_code: 3098,
      school: "Chinook Middle School",
      is_district_office: false,
    },
    {
      school_code: 3099,
      school: "Evergreen High School",
      is_district_office: false,
    },
    {
      school_code: 3163,
      school: "Cascade Middle School",
      is_district_office: false,
    },
    {
      school_code: 3165,
      school: "Hilltop Elementary",
      is_district_office: false,
    },
    {
      school_code: 3278,
      school: "Madrona Elementary",
      is_district_office: false,
    },
    {
      school_code: 3279,
      school: "Mount Rainier High School",
      is_district_office: false,
    },
    {
      school_code: 3333,
      school: "Pacific Middle School",
      is_district_office: false,
    },
    {
      school_code: 3335,
      school: "Parkside Elementary",
      is_district_office: false,
    },
    {
      school_code: 3382,
      school: "Seahurst Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3483,
      school: "Tyee High School",
      is_district_office: false,
    },
    {
      school_code: 3553,
      school: "Raisbeck Aviation High School",
      is_district_office: false,
    },
    {
      school_code: 5028,
      school: "Big Picture School",
      is_district_office: false,
    },
    {
      school_code: 5063,
      school: "Academy of Citizenship and Empowerment",
      is_district_office: false,
    },
    {
      school_code: 5064,
      school: "Global Connections High School",
      is_district_office: false,
    },
    {
      school_code: 5101,
      school: "Health Sciences & Human Services",
      is_district_office: false,
    },
    {
      school_code: 5102,
      school: "Arts & Academics Academy",
      is_district_office: false,
    },
    {
      school_code: 5103,
      school: "Technology - Engineeering & Communications",
      is_district_office: false,
    },
    {
      school_code: 5116,
      school: "Career Link",
      is_district_office: false,
    },
    {
      school_code: 5119,
      school: "Valley View Early Childhood Center",
      is_district_office: false,
    },
    {
      school_code: 5172,
      school: "Puget Sound High School",
      is_district_office: false,
    },
    {
      school_code: 5254,
      school: "Gateway to College",
      is_district_office: false,
    },
    {
      school_code: 5277,
      school: "Southwest Youth and Family Services",
      is_district_office: false,
    },
    {
      school_code: 5370,
      school: "Highline Open Doors 1418",
      is_district_office: false,
    },
    {
      school_code: 5371,
      school: "Highline Home School Center",
      is_district_office: false,
    },
    {
      school_code: 5551,
      school: "Glacier Middle School",
      is_district_office: false,
    },
    {
      school_code: 5622,
      school: "Highline Public Schools Virtual Academy",
      is_district_office: false,
    },
    {
      school_code: 5672,
      school: "Maritime High School",
      is_district_office: false,
    },
    {
      school_code: 5707,
      school: "Peninsula Alternative Programs",
      is_district_office: false,
    },
  ],
  17402: [
    {
      school_code: 1104,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1822,
      school: "Family Link",
      is_district_office: false,
    },
    {
      school_code: 1938,
      school: "Student Link",
      is_district_office: false,
    },
    {
      school_code: 2419,
      school: "Vashon Island High School",
      is_district_office: false,
    },
    {
      school_code: 3667,
      school: "McMurray Middle School",
      is_district_office: false,
    },
    {
      school_code: 4468,
      school: "Chautauqua Elementary",
      is_district_office: false,
    },
  ],
  17403: [
    {
      school_code: 1009,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1534,
      school: "Griffin Home",
      is_district_office: false,
    },
    {
      school_code: 1648,
      school: "Out Of District Facility",
      is_district_office: false,
    },
    {
      school_code: 1784,
      school: "H.O.M.E. Program",
      is_district_office: false,
    },
    {
      school_code: 2439,
      school: "Bryn Mawr Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2475,
      school: "Renton Senior High School",
      is_district_office: false,
    },
    {
      school_code: 2597,
      school: "Kennydale Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2640,
      school: "Highlands Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2929,
      school: "Lakeridge Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3034,
      school: "Campbell Hill Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3035,
      school: "McKnight Middle School",
      is_district_office: false,
    },
    {
      school_code: 3280,
      school: "Dimmitt Middle School",
      is_district_office: false,
    },
    {
      school_code: 3337,
      school: "Cascade Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3434,
      school: "Nelsen Middle School",
      is_district_office: false,
    },
    {
      school_code: 3485,
      school: "Hazelwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3521,
      school: "Renton Park Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3586,
      school: "Maplewood Heights Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3587,
      school: "Benson Hill Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3630,
      school: "Hazen Senior High School",
      is_district_office: false,
    },
    {
      school_code: 3668,
      school: "Sierra Heights Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3702,
      school: "Tiffany Park Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3740,
      school: "Talbot Hill Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3741,
      school: "Lindbergh Senior High School",
      is_district_office: false,
    },
    {
      school_code: 5070,
      school: "Renton Academy",
      is_district_office: false,
    },
    {
      school_code: 5229,
      school: "Honey Dew Elementary",
      is_district_office: false,
    },
    {
      school_code: 5282,
      school: "Talley High School",
      is_district_office: false,
    },
    {
      school_code: 5313,
      school: "Meadow Crest Early Childhood Education Center",
      is_district_office: false,
    },
    {
      school_code: 5335,
      school: "Open Door Youth Reengagement Renton",
      is_district_office: false,
    },
    {
      school_code: 5484,
      school: "Risdon Middle School",
      is_district_office: false,
    },
    {
      school_code: 5519,
      school: "Sartori Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5638,
      school: "Renton Online School",
      is_district_office: false,
    },
    {
      school_code: 5741,
      school: "Hilltop Heritage Elementary School",
      is_district_office: false,
    },
  ],
  17404: [
    {
      school_code: 1243,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2512,
      school: "Skykomish Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2513,
      school: "Skykomish High School",
      is_district_office: false,
    },
  ],
  17405: [
    {
      school_code: 1004,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1668,
      school: "Transition Program",
      is_district_office: false,
    },
    {
      school_code: 2701,
      school: "Bellevue High School",
      is_district_office: false,
    },
    {
      school_code: 2846,
      school: "Enatai Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2847,
      school: "Clyde Hill Elementary",
      is_district_office: false,
    },
    {
      school_code: 3036,
      school: "Eastgate Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3100,
      school: "Stevenson Elementary",
      is_district_office: false,
    },
    {
      school_code: 3166,
      school: "Highland Middle School",
      is_district_office: false,
    },
    {
      school_code: 3167,
      school: "Woodridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 3168,
      school: "Phantom Lake Elementary",
      is_district_office: false,
    },
    {
      school_code: 3224,
      school: "Puesta del Sol Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3225,
      school: "Lake Hills Elementary",
      is_district_office: false,
    },
    {
      school_code: 3282,
      school: "Sammamish Senior High",
      is_district_office: false,
    },
    {
      school_code: 3283,
      school: "Tyee Middle School",
      is_district_office: false,
    },
    {
      school_code: 3338,
      school: "Chinook Middle School",
      is_district_office: false,
    },
    {
      school_code: 3339,
      school: "Sherwood Forest Elementary",
      is_district_office: false,
    },
    {
      school_code: 3435,
      school: "Tillicum Middle School",
      is_district_office: false,
    },
    {
      school_code: 3436,
      school: "Medina Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3437,
      school: "Newport Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 3486,
      school: "Newport Senior High School",
      is_district_office: false,
    },
    {
      school_code: 3522,
      school: "International School",
      is_district_office: false,
    },
    {
      school_code: 3588,
      school: "Interlake Senior High School",
      is_district_office: false,
    },
    {
      school_code: 3631,
      school: "Odle Middle School",
      is_district_office: false,
    },
    {
      school_code: 3633,
      school: "Ardmore Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3634,
      school: "Spiritridge Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3705,
      school: "Bennett Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3742,
      school: "Cherry Crest Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3789,
      school: "Somerset Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5240,
      school: "Bellevue Big Picture School",
      is_district_office: false,
    },
    {
      school_code: 5281,
      school: "Central Educational Services",
      is_district_office: false,
    },
    {
      school_code: 5308,
      school: "Jing Mei Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5325,
      school: "Grad Alliance Program",
      is_district_office: false,
    },
    {
      school_code: 5508,
      school: "Wilburton Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5714,
      school: "Bellevue Digital Discovery",
      is_district_office: false,
    },
  ],
  17406: [
    {
      school_code: 1058,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2564,
      school: "Showalter Middle School",
      is_district_office: false,
    },
    {
      school_code: 2848,
      school: "Foster Senior High School",
      is_district_office: false,
    },
    {
      school_code: 3226,
      school: "Cascade View Elementary",
      is_district_office: false,
    },
    {
      school_code: 3488,
      school: "Tukwila Elementary",
      is_district_office: false,
    },
    {
      school_code: 3635,
      school: "Thorndyke Elementary",
      is_district_office: false,
    },
    {
      school_code: 5284,
      school: "Gateway",
      is_district_office: false,
    },
    {
      school_code: 5315,
      school: "Youthsource",
      is_district_office: false,
    },
    {
      school_code: 5536,
      school: "Tukwila Online Learning",
      is_district_office: false,
    },
  ],
  17407: [
    {
      school_code: 1756,
      school: "CLIP",
      is_district_office: false,
    },
    {
      school_code: 1138,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1854,
      school: "PARADE",
      is_district_office: false,
    },
    {
      school_code: 2485,
      school: "Carnation Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3006,
      school: "Eagle Rock Multiage School",
      is_district_office: false,
    },
    {
      school_code: 3101,
      school: "Cherry Valley Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3524,
      school: "Cedarcrest High School",
      is_district_office: false,
    },
    {
      school_code: 4318,
      school: "Tolt Middle School",
      is_district_office: false,
    },
    {
      school_code: 4332,
      school: "Stillwater Elementary",
      is_district_office: false,
    },
    {
      school_code: 5244,
      school: "Choice",
      is_district_office: false,
    },
  ],
  17408: [
    {
      school_code: 1025,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1915,
      school: "Special Ed School",
      is_district_office: false,
    },
    {
      school_code: 2326,
      school: "Washington Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2394,
      school: "Cascade Middle School",
      is_district_office: false,
    },
    {
      school_code: 2659,
      school: "Terminal Park Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2702,
      school: "West Auburn Senior High School",
      is_district_office: false,
    },
    {
      school_code: 2795,
      school: "Auburn Senior High School",
      is_district_office: false,
    },
    {
      school_code: 2932,
      school: "Dick Scobee Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3169,
      school: "Olympic Middle School",
      is_district_office: false,
    },
    {
      school_code: 3227,
      school: "Pioneer Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3439,
      school: "Chinook Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3525,
      school: "Lea Hill Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3669,
      school: "Gildo Rey Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3745,
      school: "Evergreen Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 3825,
      school: "Alpac Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4120,
      school: "Lake View Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4347,
      school: "Hazelwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4385,
      school: "Rainier Middle School",
      is_district_office: false,
    },
    {
      school_code: 4417,
      school: "Ilalko Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4462,
      school: "Mt Baker Middle School",
      is_district_office: false,
    },
    {
      school_code: 4474,
      school: "Auburn Riverside High School",
      is_district_office: false,
    },
    {
      school_code: 5037,
      school: "Auburn Mountainview High School",
      is_district_office: false,
    },
    {
      school_code: 5051,
      school: "Lakeland Hills Elementary",
      is_district_office: false,
    },
    {
      school_code: 5082,
      school: "Arthur Jacobsen Elementary",
      is_district_office: false,
    },
    {
      school_code: 5522,
      school: "Auburn Opportunity Project",
      is_district_office: false,
    },
    {
      school_code: 5610,
      school: "Bowman Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 5664,
      school: "Auburn Online",
      is_district_office: false,
    },
    {
      school_code: 5717,
      school: "Willow Crest Elementary",
      is_district_office: false,
    },
    {
      school_code: 5733,
      school: "West Auburn Senior High School",
      is_district_office: false,
    },
  ],
  17409: [
    {
      school_code: 1078,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2849,
      school: "Tahoma Senior High School",
      is_district_office: false,
    },
    {
      school_code: 3286,
      school: "Lake Wilderness Elementary",
      is_district_office: false,
    },
    {
      school_code: 3341,
      school: "Summit Trail Middle School",
      is_district_office: false,
    },
    {
      school_code: 3589,
      school: "Shadow Lake Elementary",
      is_district_office: false,
    },
    {
      school_code: 3937,
      school: "Maple View Middle School",
      is_district_office: false,
    },
    {
      school_code: 4415,
      school: "Rock Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 4453,
      school: "Glacier Park Elementary",
      is_district_office: false,
    },
    {
      school_code: 4556,
      school: "Tahoma Jr High",
      is_district_office: false,
    },
    {
      school_code: 5489,
      school: "Cedar River Elementary",
      is_district_office: false,
    },
    {
      school_code: 5490,
      school: "Tahoma Elementary",
      is_district_office: false,
    },
    {
      school_code: 5563,
      school: "Tahoma Open Doors",
      is_district_office: false,
    },
  ],
  17410: [
    {
      school_code: 1079,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1502,
      school: "Two Rivers School",
      is_district_office: false,
    },
    {
      school_code: 2124,
      school: "Snoqualmie Middle School",
      is_district_office: false,
    },
    {
      school_code: 2222,
      school: "Fall City Elementary",
      is_district_office: false,
    },
    {
      school_code: 2287,
      school: "North Bend Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2288,
      school: "Snoqualmie Elementary",
      is_district_office: false,
    },
    {
      school_code: 2850,
      school: "Mount Si High School",
      is_district_office: false,
    },
    {
      school_code: 4308,
      school: "Edwin R Opstad Elementary",
      is_district_office: false,
    },
    {
      school_code: 4397,
      school: "Chief Kanim Middle School",
      is_district_office: false,
    },
    {
      school_code: 5015,
      school: "Cascade View Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5374,
      school: "SVSD OPEN DOORS",
      is_district_office: false,
    },
    {
      school_code: 5135,
      school: "Twin Falls Middle School",
      is_district_office: false,
    },
    {
      school_code: 5181,
      school: "Snoqualmie Access",
      is_district_office: false,
    },
    {
      school_code: 5296,
      school: "Snoqualmie Parent Partnership Program",
      is_district_office: false,
    },
    {
      school_code: 5457,
      school: "Timber Ridge Elementary School",
      is_district_office: false,
    },
  ],
  17411: [
    {
      school_code: 1026,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1624,
      school: "Issaquah Special Services",
      is_district_office: false,
    },
    {
      school_code: 2738,
      school: "Clark Elementary",
      is_district_office: false,
    },
    {
      school_code: 3038,
      school: "Issaquah Middle School",
      is_district_office: false,
    },
    {
      school_code: 3228,
      school: "Sunset Elementary",
      is_district_office: false,
    },
    {
      school_code: 3385,
      school: "Issaquah High School",
      is_district_office: false,
    },
    {
      school_code: 3386,
      school: "Sunny Hills Elementary",
      is_district_office: false,
    },
    {
      school_code: 3440,
      school: "Briarwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 4495,
      school: "Skyline High School",
      is_district_office: false,
    },
    {
      school_code: 3569,
      school: "Echo Glen School",
      is_district_office: false,
    },
    {
      school_code: 3636,
      school: "Maywood Middle School",
      is_district_office: false,
    },
    {
      school_code: 3637,
      school: "Maple Hills Elementary",
      is_district_office: false,
    },
    {
      school_code: 3673,
      school: "Issaquah Valley Elementary",
      is_district_office: false,
    },
    {
      school_code: 3746,
      school: "Apollo Elementary",
      is_district_office: false,
    },
    {
      school_code: 3879,
      school: "Pine Lake Middle School",
      is_district_office: false,
    },
    {
      school_code: 3962,
      school: "Liberty Sr High School",
      is_district_office: false,
    },
    {
      school_code: 4300,
      school: "Challenger Elementary",
      is_district_office: false,
    },
    {
      school_code: 4375,
      school: "Cougar Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 4376,
      school: "Discovery Elementary",
      is_district_office: false,
    },
    {
      school_code: 4460,
      school: "Beaver Lake Middle School",
      is_district_office: false,
    },
    {
      school_code: 4493,
      school: "Endeavour Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4565,
      school: "Cascade Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 4592,
      school: "Newcastle Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5056,
      school: "Grand Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 5062,
      school: "Issaquah ECEAP",
      is_district_office: false,
    },
    {
      school_code: 5200,
      school: "Pacific Cascade Middle School",
      is_district_office: false,
    },
    {
      school_code: 5201,
      school: "Creekside Elementary",
      is_district_office: false,
    },
    {
      school_code: 5437,
      school: "Gibson Ek High School",
      is_district_office: false,
    },
    {
      school_code: 5577,
      school: "Issaquah Preschool",
      is_district_office: false,
    },
    {
      school_code: 5673,
      school: "CEDAR TRAILS ELEMENTARY",
      is_district_office: false,
    },
    {
      school_code: 5674,
      school: "COUGAR MOUNTAIN MIDDLE SCHOOL",
      is_district_office: false,
    },
  ],
  17412: [
    {
      school_code: 1010,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1667,
      school: "Handicapped Contractual Services",
      is_district_office: false,
    },
    {
      school_code: 1771,
      school: "Home Education Exchange",
      is_district_office: false,
    },
    {
      school_code: 1942,
      school: "Cascade K-8 Community School",
      is_district_office: false,
    },
    {
      school_code: 2185,
      school: "Lake Forest Park Elementary",
      is_district_office: false,
    },
    {
      school_code: 2612,
      school: "Fircrest Residential Habilitation",
      is_district_office: false,
    },
    {
      school_code: 2703,
      school: "Ridgecrest Elementary",
      is_district_office: false,
    },
    {
      school_code: 2990,
      school: "Briarcrest Elementary",
      is_district_office: false,
    },
    {
      school_code: 3104,
      school: "Echo Lake Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3230,
      school: "Brookside Elementary",
      is_district_office: false,
    },
    {
      school_code: 3231,
      school: "Highland Terrace Elementary",
      is_district_office: false,
    },
    {
      school_code: 3343,
      school: "Shorecrest High School",
      is_district_office: false,
    },
    {
      school_code: 3387,
      school: "Kellogg Middle School",
      is_district_office: false,
    },
    {
      school_code: 3489,
      school: "Parkwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 3527,
      school: "Melvin G Syre Elementary",
      is_district_office: false,
    },
    {
      school_code: 3674,
      school: "Albert Einstein Middle School",
      is_district_office: false,
    },
    {
      school_code: 3921,
      school: "Shorewood High School",
      is_district_office: false,
    },
    {
      school_code: 3958,
      school: "Meridian Park Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5287,
      school: "Early Childhood Education",
      is_district_office: false,
    },
    {
      school_code: 5314,
      school: "Head Start",
      is_district_office: false,
    },
    {
      school_code: 5592,
      school: "North City",
      is_district_office: false,
    },
    {
      school_code: 5593,
      school: "Edwin Pratt Learning Center",
      is_district_office: false,
    },
  ],
  17414: [
    {
      school_code: 1011,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1649,
      school: "Contractual Schools",
      is_district_office: false,
    },
    {
      school_code: 1658,
      school: "Discovery School",
      is_district_office: false,
    },
    {
      school_code: 1687,
      school: "Explorer Community School",
      is_district_office: false,
    },
    {
      school_code: 1688,
      school: "Emerson K-12",
      is_district_office: false,
    },
    {
      school_code: 1706,
      school: "International Community School",
      is_district_office: false,
    },
    {
      school_code: 1800,
      school: "Environmental & Adventure School",
      is_district_office: false,
    },
    {
      school_code: 1804,
      school: "Futures School",
      is_district_office: false,
    },
    {
      school_code: 1975,
      school: "Stella Schola",
      is_district_office: false,
    },
    {
      school_code: 2289,
      school: "Redmond Elementary",
      is_district_office: false,
    },
    {
      school_code: 2308,
      school: "Kirkland Middle School",
      is_district_office: false,
    },
    {
      school_code: 2739,
      school: "Lake Washington High",
      is_district_office: false,
    },
    {
      school_code: 2796,
      school: "Juanita Elementary",
      is_district_office: false,
    },
    {
      school_code: 2992,
      school: "Rose Hill Elementary",
      is_district_office: false,
    },
    {
      school_code: 3041,
      school: "Lakeview Elementary",
      is_district_office: false,
    },
    {
      school_code: 3232,
      school: "Redmond Middle School",
      is_district_office: false,
    },
    {
      school_code: 3441,
      school: "Twain Elementary",
      is_district_office: false,
    },
    {
      school_code: 3490,
      school: "Thoreau Elementary",
      is_district_office: false,
    },
    {
      school_code: 3528,
      school: "Redmond High",
      is_district_office: false,
    },
    {
      school_code: 3529,
      school: "Mann Elementary",
      is_district_office: false,
    },
    {
      school_code: 3548,
      school: "Audubon Elementary",
      is_district_office: false,
    },
    {
      school_code: 3549,
      school: "Ready Start Preschool",
      is_district_office: false,
    },
    {
      school_code: 3590,
      school: "Finn Hill Middle School",
      is_district_office: false,
    },
    {
      school_code: 3591,
      school: "Franklin Elementary",
      is_district_office: false,
    },
    {
      school_code: 3592,
      school: "Bell Elementary",
      is_district_office: false,
    },
    {
      school_code: 3675,
      school: "Frost Elementary",
      is_district_office: false,
    },
    {
      school_code: 3703,
      school: "Rush Elementary",
      is_district_office: false,
    },
    {
      school_code: 3704,
      school: "Keller Elementary",
      is_district_office: false,
    },
    {
      school_code: 3706,
      school: "Rose Hill Middle School",
      is_district_office: false,
    },
    {
      school_code: 3747,
      school: "Sandburg Elementary",
      is_district_office: false,
    },
    {
      school_code: 3748,
      school: "Muir Elementary",
      is_district_office: false,
    },
    {
      school_code: 3771,
      school: "Juanita High",
      is_district_office: false,
    },
    {
      school_code: 3855,
      school: "Emerson High School",
      is_district_office: false,
    },
    {
      school_code: 3856,
      school: "Community School",
      is_district_office: false,
    },
    {
      school_code: 3922,
      school: "Kamiakin Middle School",
      is_district_office: false,
    },
    {
      school_code: 3941,
      school: "Kirk Elementary",
      is_district_office: false,
    },
    {
      school_code: 4018,
      school: "Dickinson Elementary",
      is_district_office: false,
    },
    {
      school_code: 4096,
      school: "Mead Elementary",
      is_district_office: false,
    },
    {
      school_code: 4147,
      school: "Rockwell Elementary",
      is_district_office: false,
    },
    {
      school_code: 4148,
      school: "Evergreen Middle School",
      is_district_office: false,
    },
    {
      school_code: 4167,
      school: "Northstar Middle School",
      is_district_office: false,
    },
    {
      school_code: 4256,
      school: "Alcott Elementary",
      is_district_office: false,
    },
    {
      school_code: 4302,
      school: "Smith Elementary",
      is_district_office: false,
    },
    {
      school_code: 4336,
      school: "Wilder Elementary",
      is_district_office: false,
    },
    {
      school_code: 4354,
      school: "Mcauliffe Elementary",
      is_district_office: false,
    },
    {
      school_code: 4386,
      school: "Inglewood Middle School",
      is_district_office: false,
    },
    {
      school_code: 4424,
      school: "Einstein Elementary",
      is_district_office: false,
    },
    {
      school_code: 4439,
      school: "Eastlake High School",
      is_district_office: false,
    },
    {
      school_code: 4532,
      school: "Blackwell Elementary",
      is_district_office: false,
    },
    {
      school_code: 5053,
      school: "Rosa Parks Elementary",
      is_district_office: false,
    },
    {
      school_code: 5057,
      school: "Renaissance School",
      is_district_office: false,
    },
    {
      school_code: 5139,
      school: "Carson Elementary",
      is_district_office: false,
    },
    {
      school_code: 5265,
      school: "Tesla STEM High School",
      is_district_office: false,
    },
    {
      school_code: 5479,
      school: "Birth - 2 Program",
      is_district_office: false,
    },
    {
      school_code: 5511,
      school: "Clara Barton Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5512,
      school: "Ella Baker Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5597,
      school: "Timberline Middle School",
      is_district_office: false,
    },
    {
      school_code: 5598,
      school: "Old Redmond Schoolhouse",
      is_district_office: false,
    },
    {
      school_code: 5678,
      school: "Lake Washington SD Online School",
      is_district_office: false,
    },
    {
      school_code: 5958,
      school: "Washington Network for Innovative Careers",
      is_district_office: false,
    },
  ],
  17415: [
    {
      school_code: 1012,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1807,
      school: "Regional Justice Center",
      is_district_office: false,
    },
    {
      school_code: 2565,
      school: "Meridian Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2797,
      school: "Kent-Meridian High School",
      is_district_office: false,
    },
    {
      school_code: 2851,
      school: "East Hill Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3014,
      school: "Kent Mountain View Academy",
      is_district_office: false,
    },
    {
      school_code: 3233,
      school: "Meridian Middle School",
      is_district_office: false,
    },
    {
      school_code: 3388,
      school: "Covington Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3389,
      school: "Scenic Hill Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3491,
      school: "Park Orchard Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3550,
      school: "Lake Youngs Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3593,
      school: "Pine Tree Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3640,
      school: "Kentridge High School",
      is_district_office: false,
    },
    {
      school_code: 3676,
      school: "Cedar Valley Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3677,
      school: "Springbrook Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3678,
      school: "Fairwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3707,
      school: "Soos Creek Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3708,
      school: "Grass Lake Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3764,
      school: "Meeker Middle School",
      is_district_office: false,
    },
    {
      school_code: 4126,
      school: "Crestwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4127,
      school: "Mattson Middle School",
      is_district_office: false,
    },
    {
      school_code: 4128,
      school: "Kentwood High School",
      is_district_office: false,
    },
    {
      school_code: 4293,
      school: "Ridgewood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4294,
      school: "Martin Sortun Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4301,
      school: "Jenkins Creek Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4345,
      school: "Horizon Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4353,
      school: "Carriage Crest Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4356,
      school: "Neely O Brien Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4413,
      school: "George T. Daniel Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4420,
      school: "Sunrise Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4440,
      school: "Cedar Heights Middle School",
      is_district_office: false,
    },
    {
      school_code: 4465,
      school: "Meadow Ridge Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4466,
      school: "Sawyer Woods Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4485,
      school: "Northwood Middle School",
      is_district_office: false,
    },
    {
      school_code: 4489,
      school: "Glenridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 4492,
      school: "Kentlake High School",
      is_district_office: false,
    },
    {
      school_code: 4520,
      school: "Kent Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4545,
      school: "Emerald Park Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4581,
      school: "Millennium Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5016,
      school: "Mill Creek Middle School",
      is_district_office: false,
    },
    {
      school_code: 5098,
      school: "Kent Phoenix Academy",
      is_district_office: false,
    },
    {
      school_code: 5150,
      school: "Birth to Age 2",
      is_district_office: false,
    },
    {
      school_code: 5178,
      school: "Panther Lake Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5440,
      school: "The Outreach Program",
      is_district_office: false,
    },
    {
      school_code: 5275,
      school: "iGrad",
      is_district_office: false,
    },
    {
      school_code: 5676,
      school: "Kent Laboratory Academy",
      is_district_office: false,
    },
    {
      school_code: 5677,
      school: "River Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 5729,
      school: "Kent Virtual Academy",
      is_district_office: false,
    },
    {
      school_code: 5738,
      school: "Canyon Ridge Middle School",
      is_district_office: false,
    },
  ],
  17417: [
    {
      school_code: 1027,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1814,
      school: "Northshore Networks",
      is_district_office: false,
    },
    {
      school_code: 1815,
      school: "Northshore Special Services",
      is_district_office: false,
    },
    {
      school_code: 2493,
      school: "C O Sorenson",
      is_district_office: false,
    },
    {
      school_code: 2993,
      school: "Kenmore Elementary",
      is_district_office: false,
    },
    {
      school_code: 3105,
      school: "Crystal Springs Elementary",
      is_district_office: false,
    },
    {
      school_code: 3106,
      school: "Bothell High School",
      is_district_office: false,
    },
    {
      school_code: 3107,
      school: "Arrowhead Elementary",
      is_district_office: false,
    },
    {
      school_code: 3234,
      school: "Cottage Lake Elementary",
      is_district_office: false,
    },
    {
      school_code: 3287,
      school: "Westhill Elementary",
      is_district_office: false,
    },
    {
      school_code: 3344,
      school: "Maywood Hills Elementary",
      is_district_office: false,
    },
    {
      school_code: 3345,
      school: "Kenmore Middle School",
      is_district_office: false,
    },
    {
      school_code: 3390,
      school: "Lockwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 3396,
      school: "Woodinville Community Center",
      is_district_office: false,
    },
    {
      school_code: 3442,
      school: "Moorlands Elementary",
      is_district_office: false,
    },
    {
      school_code: 3492,
      school: "Inglemoor HS",
      is_district_office: false,
    },
    {
      school_code: 3493,
      school: "Canyon Park Middle School",
      is_district_office: false,
    },
    {
      school_code: 3679,
      school: "Shelton View Elementary",
      is_district_office: false,
    },
    {
      school_code: 3749,
      school: "Woodin Elementary",
      is_district_office: false,
    },
    {
      school_code: 3790,
      school: "Leota Middle School",
      is_district_office: false,
    },
    {
      school_code: 3811,
      school: "Secondary Academy for Success",
      is_district_office: false,
    },
    {
      school_code: 4017,
      school: "Canyon Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 4021,
      school: "Northshore Middle School",
      is_district_office: false,
    },
    {
      school_code: 4069,
      school: "Wellington Elementary",
      is_district_office: false,
    },
    {
      school_code: 4124,
      school: "Hollywood Hill Elementary",
      is_district_office: false,
    },
    {
      school_code: 4187,
      school: "Sunrise Elementary",
      is_district_office: false,
    },
    {
      school_code: 4208,
      school: "Woodinville HS",
      is_district_office: false,
    },
    {
      school_code: 4305,
      school: "Bear Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 4306,
      school: "Fernwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 4355,
      school: "Frank Love Elementary",
      is_district_office: false,
    },
    {
      school_code: 4371,
      school: "Skyview Middle School",
      is_district_office: false,
    },
    {
      school_code: 4377,
      school: "Woodmoor Elementary",
      is_district_office: false,
    },
    {
      school_code: 4379,
      school: "East Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 4455,
      school: "Kokanee Elementary",
      is_district_office: false,
    },
    {
      school_code: 4516,
      school: "Timbercrest Middle School",
      is_district_office: false,
    },
    {
      school_code: 5331,
      school: "Northshore Online School",
      is_district_office: false,
    },
    {
      school_code: 5453,
      school: "Northshore Primary Center",
      is_district_office: false,
    },
    {
      school_code: 5481,
      school: "North Creek High School",
      is_district_office: false,
    },
    {
      school_code: 5583,
      school: "Northshore Family Partnership",
      is_district_office: false,
    },
    {
      school_code: 5605,
      school: "Ruby Bridges Elementary",
      is_district_office: false,
    },
    {
      school_code: 5606,
      school: "Innovation Lab High School",
      is_district_office: false,
    },
    {
      school_code: 5753,
      school: "Northshore Learning Options",
      is_district_office: false,
    },
  ],
  17801: [
    {
      school_code: 5619,
      school: "Dropout Prevention and Reengagement Academy",
      is_district_office: false,
    },
  ],
  17902: [
    {
      school_code: 1347,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5375,
      school: "Summit Public School: Sierra",
      is_district_office: false,
    },
  ],
  17903: [
    {
      school_code: 1330,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1986,
      school: "Muckleshoot Tribal School",
      is_district_office: false,
    },
  ],
  17905: [
    {
      school_code: 1345,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5469,
      school: "Summit Public School: Atlas",
      is_district_office: false,
    },
  ],
  17906: [
    {
      school_code: 5377,
      school: "Excel Public Charter School",
      is_district_office: false,
    },
  ],
  17908: [
    {
      school_code: 1339,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5380,
      school: "Rainier Prep",
      is_district_office: false,
    },
  ],
  17910: [
    {
      school_code: 1325,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5468,
      school: "Rainier Valley Leadership Academy",
      is_district_office: false,
    },
  ],
  17911: [
    {
      school_code: 1327,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5517,
      school: "Impact | Puget Sound Elementary",
      is_district_office: false,
    },
  ],
  17915: [
    {
      school_code: 5602,
      school: "Ashe Preparatory Academy",
      is_district_office: false,
    },
  ],
  17916: [
    {
      school_code: 1359,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5608,
      school: "Impact | Salish Sea Elementary",
      is_district_office: false,
    },
  ],
  17917: [
    {
      school_code: 1358,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5662,
      school: "Cascade Public Schools",
      is_district_office: false,
    },
  ],
  17919: [
    {
      school_code: 1367,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5736,
      school: "Impact | Black River Elementary",
      is_district_office: false,
    },
  ],
  17937: [
    {
      school_code: 5306,
      school: "Open Doors at LWIT",
      is_district_office: false,
    },
    {
      school_code: 5953,
      school: "Lake Washington Technical Academy",
      is_district_office: false,
    },
  ],
  17941: [
    {
      school_code: 5590,
      school: "Ella Baker High School (Open Doors)",
      is_district_office: false,
    },
    {
      school_code: 5591,
      school: "Renton Technical High School",
      is_district_office: false,
    },
  ],
  18100: [
    {
      school_code: 1037,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1737,
      school: "Renaissance Alternative High School",
      is_district_office: false,
    },
    {
      school_code: 1749,
      school: "Bremerton Home Link Program",
      is_district_office: false,
    },
    {
      school_code: 2613,
      school: "West Hills S.T.E.M. Academy",
      is_district_office: false,
    },
    {
      school_code: 2853,
      school: "View Ridge Elementary Arts Academy",
      is_district_office: false,
    },
    {
      school_code: 3108,
      school: "Crownhill Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3109,
      school: "Bremerton High School",
      is_district_office: false,
    },
    {
      school_code: 3171,
      school: "Naval Avenue Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3641,
      school: "Armin Jahr Elementary",
      is_district_office: false,
    },
    {
      school_code: 3883,
      school: "Morgan Center School",
      is_district_office: false,
    },
    {
      school_code: 4038,
      school: "West Sound Technical Skills Center",
      is_district_office: false,
    },
    {
      school_code: 4421,
      school: "Kitsap Lake Elementary",
      is_district_office: false,
    },
    {
      school_code: 4441,
      school: "Mountain View Middle School",
      is_district_office: false,
    },
    {
      school_code: 5161,
      school: "Special Services",
      is_district_office: false,
    },
  ],
  18303: [
    {
      school_code: 1080,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1699,
      school: "Odyssey Multiage Program",
      is_district_office: false,
    },
    {
      school_code: 1841,
      school: "Mosaic Home Education Partnership",
      is_district_office: false,
    },
    {
      school_code: 1935,
      school: "Eagle Harbor High School",
      is_district_office: false,
    },
    {
      school_code: 1939,
      school: "Bainbridge Special Education Services",
      is_district_office: false,
    },
    {
      school_code: 2395,
      school: "Bainbridge High School",
      is_district_office: false,
    },
    {
      school_code: 3043,
      school: "Capt. Charles Wilkes Elem School",
      is_district_office: false,
    },
    {
      school_code: 3552,
      school: "Capt Johnston Blakely Elem Sch",
      is_district_office: false,
    },
    {
      school_code: 4062,
      school: "Ordway Elementary",
      is_district_office: false,
    },
    {
      school_code: 4505,
      school: "Woodward Middle School",
      is_district_office: false,
    },
    {
      school_code: 4542,
      school: "Sakai Intermediate",
      is_district_office: false,
    },
  ],
  18400: [
    {
      school_code: 1067,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1677,
      school: "Special Programs",
      is_district_office: false,
    },
    {
      school_code: 1733,
      school: "Parent Assisted Learning",
      is_district_office: false,
    },
    {
      school_code: 2026,
      school: "Poulsbo Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2476,
      school: "Poulsbo Middle School",
      is_district_office: false,
    },
    {
      school_code: 2798,
      school: "David Wolfle Elementary",
      is_district_office: false,
    },
    {
      school_code: 2854,
      school: "Hilder Pearson Elementary",
      is_district_office: false,
    },
    {
      school_code: 3126,
      school: "Middle School Options",
      is_district_office: false,
    },
    {
      school_code: 3236,
      school: "North Kitsap High School",
      is_district_office: false,
    },
    {
      school_code: 3391,
      school: "Suquamish Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4359,
      school: "Kingston Middle School",
      is_district_office: false,
    },
    {
      school_code: 4461,
      school: "Vinland Elementary",
      is_district_office: false,
    },
    {
      school_code: 4467,
      school: "Richard Gordon Elementary",
      is_district_office: false,
    },
    {
      school_code: 5546,
      school: "CHOICE Academy",
      is_district_office: false,
    },
    {
      school_code: 5085,
      school: "Kingston High School",
      is_district_office: false,
    },
    {
      school_code: 5646,
      school: "North Kitsap Options",
      is_district_office: false,
    },
  ],
  18401: [
    {
      school_code: 1068,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1740,
      school: "Off Campus",
      is_district_office: false,
    },
    {
      school_code: 2615,
      school: "Central Kitsap High School",
      is_district_office: false,
    },
    {
      school_code: 2994,
      school: "Brownsville Elementary",
      is_district_office: false,
    },
    {
      school_code: 3237,
      school: "Central Kitsap Middle School",
      is_district_office: false,
    },
    {
      school_code: 3594,
      school: "John D. Bud Hawk Elementary at Jackson Park",
      is_district_office: false,
    },
    {
      school_code: 3791,
      school: "Fairview Middle School",
      is_district_office: false,
    },
    {
      school_code: 3936,
      school: "Alternative High School",
      is_district_office: false,
    },
    {
      school_code: 4014,
      school: "Cottonwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4015,
      school: "Esquire Hills Elementary",
      is_district_office: false,
    },
    {
      school_code: 4016,
      school: "Clear Creek Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4100,
      school: "Olympic High School",
      is_district_office: false,
    },
    {
      school_code: 4101,
      school: "Silverdale Elementary",
      is_district_office: false,
    },
    {
      school_code: 4135,
      school: "Woodlands Elementary",
      is_district_office: false,
    },
    {
      school_code: 4249,
      school: "Ridgetop Middle School",
      is_district_office: false,
    },
    {
      school_code: 4341,
      school: "Cougar Valley Elementary",
      is_district_office: false,
    },
    {
      school_code: 4372,
      school: "Silver Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 4393,
      school: "Green Mountain Elementary",
      is_district_office: false,
    },
    {
      school_code: 4444,
      school: "Emerald Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 4509,
      school: "Klahowya Secondary",
      is_district_office: false,
    },
    {
      school_code: 4527,
      school: "Pinecrest Elementary",
      is_district_office: false,
    },
    {
      school_code: 5472,
      school: "Barker Creek Community School",
      is_district_office: false,
    },
  ],
  18402: [
    {
      school_code: 1038,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1718,
      school: "Explorer Academy",
      is_district_office: false,
    },
    {
      school_code: 2272,
      school: "South Kitsap High School",
      is_district_office: false,
    },
    {
      school_code: 2641,
      school: "East Port Orchard Elementary",
      is_district_office: false,
    },
    {
      school_code: 2650,
      school: "Orchard Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 2995,
      school: "Olalla Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3046,
      school: "Marcus Whitman Middle School",
      is_district_office: false,
    },
    {
      school_code: 3110,
      school: "South Colby Elementary",
      is_district_office: false,
    },
    {
      school_code: 3680,
      school: "Cedar Heights Middle School",
      is_district_office: false,
    },
    {
      school_code: 3899,
      school: "Discovery",
      is_district_office: false,
    },
    {
      school_code: 4029,
      school: "Burley Glenwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 4079,
      school: "Manchester Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4141,
      school: "Sunnyslope Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4142,
      school: "John Sedgwick Middle School",
      is_district_office: false,
    },
    {
      school_code: 4348,
      school: "Hidden Creek Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4349,
      school: "Sidney Glen Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4350,
      school: "Mullenix Ridge Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5072,
      school: "Madrona Heights PreSchool Program",
      is_district_office: false,
    },
  ],
  18801: [
    {
      school_code: 3143,
      school: "Clallam Co Juvenile Detention",
      is_district_office: false,
    },
    {
      school_code: 3481,
      school: "Kitsap Co Detention Ctr",
      is_district_office: false,
    },
  ],
  18901: [
    {
      school_code: 1357,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5607,
      school: "Catalyst Public Schools",
      is_district_office: false,
    },
  ],
  18902: [
    {
      school_code: 1348,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5319,
      school: "Chief Kitsap Academy",
      is_district_office: false,
    },
  ],
  19007: [
    {
      school_code: 1280,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2077,
      school: "Damman Elementary",
      is_district_office: false,
    },
  ],
  19028: [
    {
      school_code: 1237,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3554,
      school: "Easton School",
      is_district_office: false,
    },
    {
      school_code: 5242,
      school: "Easton Secondary School",
      is_district_office: false,
    },
  ],
  19400: [
    {
      school_code: 1238,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2514,
      school: "Thorp Elem & Jr Sr High",
      is_district_office: false,
    },
  ],
  19401: [
    {
      school_code: 1045,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1924,
      school: "Ellensburg Developmental Preschool",
      is_district_office: false,
    },
    {
      school_code: 2453,
      school: "Morgan Middle School",
      is_district_office: false,
    },
    {
      school_code: 2741,
      school: "Lincoln Elementary",
      is_district_office: false,
    },
    {
      school_code: 2996,
      school: "Ellensburg High School",
      is_district_office: false,
    },
    {
      school_code: 3596,
      school: "Mt. Stuart Elementary",
      is_district_office: false,
    },
    {
      school_code: 4411,
      school: "Valley View Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5097,
      school: "K-12 Ellensburg Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5186,
      school: "Excel High School",
      is_district_office: false,
    },
    {
      school_code: 5718,
      school: "Ida Nason Aronica Elementary",
      is_district_office: false,
    },
  ],
  19403: [
    {
      school_code: 1190,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2569,
      school: "Kittitas Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2766,
      school: "Kittitas High School",
      is_district_office: false,
    },
    {
      school_code: 3213,
      school: "Parke Creek Treatment Ctr",
      is_district_office: false,
    },
    {
      school_code: 5086,
      school: "Kittitas B-5 Special Ed Program",
      is_district_office: false,
    },
  ],
  19404: [
    {
      school_code: 1128,
      school: "District Office -  Cle Elum",
      is_district_office: true,
    },
    {
      school_code: 1987,
      school: "Swiftwater Learning Center - Cle Elum",
      is_district_office: false,
    },
    {
      school_code: 2328,
      school: "Cle Elum Roslyn Elementary - Cle Elum",
      is_district_office: false,
    },
    {
      school_code: 2329,
      school: "Cle Elum Roslyn High School - Cle Elum",
      is_district_office: false,
    },
    {
      school_code: 2570,
      school: "Walter Strom Middle School - Cle Elum",
      is_district_office: false,
    },
  ],
  20094: [
    {
      school_code: 1244,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2605,
      school: "Wishram High And Elementary Schl",
      is_district_office: false,
    },
  ],
  20203: [
    {
      school_code: 1239,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3392,
      school: "Bickleton Elementary & High Schl",
      is_district_office: false,
    },
  ],
  20215: [
    {
      school_code: 1281,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2251,
      school: "Centerville Elementary",
      is_district_office: false,
    },
  ],
  20400: [
    {
      school_code: 1245,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2676,
      school: "Trout Lake School",
      is_district_office: false,
    },
    {
      school_code: 3062,
      school: "Trout Lake Elementary",
      is_district_office: false,
    },
  ],
  20401: [
    {
      school_code: 1246,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3047,
      school: "Glenwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 3048,
      school: "Glenwood Secondary",
      is_district_office: false,
    },
  ],
  20402: [
    {
      school_code: 1221,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3494,
      school: "Klickitat Elem & High",
      is_district_office: false,
    },
  ],
  20403: [
    {
      school_code: 1282,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3530,
      school: "Roosevelt Elementary School",
      is_district_office: false,
    },
  ],
  20404: [
    {
      school_code: 1129,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2677,
      school: "Goldendale Primary School",
      is_district_office: false,
    },
    {
      school_code: 2856,
      school: "Goldendale High School",
      is_district_office: false,
    },
    {
      school_code: 3393,
      school: "Goldendale Middle School",
      is_district_office: false,
    },
    {
      school_code: 5012,
      school: "Goldendale Support Service Center",
      is_district_office: false,
    },
    {
      school_code: 5618,
      school: "Washington Connections Academy Goldendale",
      is_district_office: false,
    },
  ],
  20405: [
    {
      school_code: 1112,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2330,
      school: "Columbia High School",
      is_district_office: false,
    },
    {
      school_code: 2997,
      school: "Hulan L Whitson Elem",
      is_district_office: false,
    },
    {
      school_code: 3394,
      school: "Wayne M Henkle Middle School",
      is_district_office: false,
    },
    {
      school_code: 5077,
      school: "White Salmon Academy",
      is_district_office: false,
    },
    {
      school_code: 5368,
      school: "Wallace & Priscilla Stevenson Intermediate School",
      is_district_office: false,
    },
  ],
  20406: [
    {
      school_code: 1200,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3049,
      school: "Dallesport Elementary",
      is_district_office: false,
    },
    {
      school_code: 3111,
      school: "Lyle High School",
      is_district_office: false,
    },
    {
      school_code: 3643,
      school: "Lyle Middle School",
      is_district_office: false,
    },
    {
      school_code: 5503,
      school: "Student Success Open Doors Academy",
      is_district_office: false,
    },
  ],
  21014: [
    {
      school_code: 1203,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2273,
      school: "Napavine Jr Sr High School",
      is_district_office: false,
    },
    {
      school_code: 3288,
      school: "Napavine Elementary",
      is_district_office: false,
    },
  ],
  21036: [
    {
      school_code: 1284,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2355,
      school: "Evaline Elementary School",
      is_district_office: false,
    },
  ],
  21206: [
    {
      school_code: 1169,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2572,
      school: "Mossyrock Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3238,
      school: "Mossyrock Jr./Sr. High School",
      is_district_office: false,
    },
    {
      school_code: 5415,
      school: "Mossyrock Academy",
      is_district_office: false,
    },
  ],
  21214: [
    {
      school_code: 1170,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2678,
      school: "Morton Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3112,
      school: "Morton Junior-Senior High",
      is_district_office: false,
    },
  ],
  21226: [
    {
      school_code: 1222,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2227,
      school: "Adna Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2441,
      school: "Adna Middle/High School",
      is_district_office: false,
    },
  ],
  21232: [
    {
      school_code: 1144,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1829,
      school: "Winolequa Learning Academy",
      is_district_office: false,
    },
    {
      school_code: 2290,
      school: "Winlock Miller Elementary",
      is_district_office: false,
    },
    {
      school_code: 3597,
      school: "Winlock Senior High",
      is_district_office: false,
    },
    {
      school_code: 4369,
      school: "Winlock Middle School",
      is_district_office: false,
    },
  ],
  21234: [
    {
      school_code: 1248,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2516,
      school: "Boistfort Elem",
      is_district_office: false,
    },
    {
      school_code: 5748,
      school: "Boistfort Online School",
      is_district_office: false,
    },
  ],
  21237: [
    {
      school_code: 1145,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2616,
      school: "Toledo High School",
      is_district_office: false,
    },
    {
      school_code: 2998,
      school: "Toledo Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3977,
      school: "Toledo Middle School",
      is_district_office: false,
    },
    {
      school_code: 5190,
      school: "Cowlitz Prairie Academy",
      is_district_office: false,
    },
  ],
  21300: [
    {
      school_code: 1171,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2331,
      school: "Onalaska High School",
      is_district_office: false,
    },
    {
      school_code: 3239,
      school: "Onalaska Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4335,
      school: "Onalaska Middle School",
      is_district_office: false,
    },
    {
      school_code: 5146,
      school: "CVA - Onalaska",
      is_district_office: false,
    },
  ],
  21301: [
    {
      school_code: 1204,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1925,
      school: "Trojan Alternative School",
      is_district_office: false,
    },
    {
      school_code: 2858,
      school: "Pe Ell School",
      is_district_office: false,
    },
  ],
  21302: [
    {
      school_code: 1065,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1559,
      school: "Lewis County Juvenile Detention",
      is_district_office: false,
    },
    {
      school_code: 2027,
      school: "Green Hill Academic School",
      is_district_office: false,
    },
    {
      school_code: 2274,
      school: "Cascade Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2442,
      school: "R E Bennett Elementary",
      is_district_office: false,
    },
    {
      school_code: 2799,
      school: "W F West High School",
      is_district_office: false,
    },
    {
      school_code: 3346,
      school: "Olympic Elementary",
      is_district_office: false,
    },
    {
      school_code: 4311,
      school: "Chehalis Middle School",
      is_district_office: false,
    },
    {
      school_code: 5317,
      school: "Lewis County Jail",
      is_district_office: false,
    },
    {
      school_code: 5369,
      school: "Lewis County Alternative School",
      is_district_office: false,
    },
    {
      school_code: 5509,
      school: "James W Lintott Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5510,
      school: "Orin C Smith Elementary School",
      is_district_office: false,
    },
  ],
  21303: [
    {
      school_code: 1146,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2859,
      school: "White Pass Jr. Sr. High School",
      is_district_office: false,
    },
    {
      school_code: 3555,
      school: "White Pass Elementary School",
      is_district_office: false,
    },
  ],
  21401: [
    {
      school_code: 1066,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2166,
      school: "Centralia High School",
      is_district_office: false,
    },
    {
      school_code: 2244,
      school: "Edison Elementary",
      is_district_office: false,
    },
    {
      school_code: 2291,
      school: "Oakview Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2704,
      school: "Fords Prairie Elementary",
      is_district_office: false,
    },
    {
      school_code: 2768,
      school: "Washington Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3172,
      school: "Jefferson Lincoln Elementary",
      is_district_office: false,
    },
    {
      school_code: 3240,
      school: "Centralia Middle School",
      is_district_office: false,
    },
    {
      school_code: 5359,
      school: "Futurus High School",
      is_district_office: false,
    },
    {
      school_code: 5463,
      school: "Early Learning Center",
      is_district_office: false,
    },
  ],
  21926: [
    {
      school_code: 3598,
      school: "Garrett Heyns High School",
      is_district_office: false,
    },
  ],
  22008: [
    {
      school_code: 1228,
      school: "District Office -  Sprague",
      is_district_office: true,
    },
    {
      school_code: 2186,
      school: "Sprague High School",
      is_district_office: false,
    },
    {
      school_code: 3050,
      school: "Sprague Elementary",
      is_district_office: false,
    },
  ],
  22009: [
    {
      school_code: 1180,
      school: "District Office -  Reardan",
      is_district_office: true,
    },
    {
      school_code: 2478,
      school: "Reardan Middle-Senior High School",
      is_district_office: false,
    },
    {
      school_code: 2864,
      school: "Reardan Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5688,
      school: "Reardan Options' Program",
      is_district_office: false,
    },
  ],
  22017: [
    {
      school_code: 1229,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2860,
      school: "Almira Elementary School",
      is_district_office: false,
    },
  ],
  22073: [
    {
      school_code: 1230,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2862,
      school: "Creston Elementary",
      is_district_office: false,
    },
    {
      school_code: 2863,
      school: "Creston Jr-Sr High School",
      is_district_office: false,
    },
  ],
  22105: [
    {
      school_code: 1177,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2443,
      school: "Odessa High School",
      is_district_office: false,
    },
    {
      school_code: 2769,
      school: "P C Jantz Elementary",
      is_district_office: false,
    },
  ],
  22200: [
    {
      school_code: 1178,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3289,
      school: "Wilbur Secondary School",
      is_district_office: false,
    },
    {
      school_code: 3290,
      school: "Wilbur Elementary School",
      is_district_office: false,
    },
  ],
  22204: [
    {
      school_code: 1205,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2743,
      school: "Harrington Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3113,
      school: "Harrington High School",
      is_district_office: false,
    },
  ],
  22207: [
    {
      school_code: 1179,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1833,
      school: "Davenport Alternative Learning Ct",
      is_district_office: false,
    },
    {
      school_code: 2668,
      school: "Davenport Elementary",
      is_district_office: false,
    },
    {
      school_code: 3173,
      school: "Davenport Senior High School",
      is_district_office: false,
    },
    {
      school_code: 5603,
      school: "Lincoln County Tech",
      is_district_office: false,
    },
    {
      school_code: 5643,
      school: "Lincoln County Virtual Academy",
      is_district_office: false,
    },
    {
      school_code: 5728,
      school: "Lincoln County Pathways Academy",
      is_district_office: false,
    },
  ],
  23042: [
    {
      school_code: 1285,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2744,
      school: "Southside Elementary",
      is_district_office: false,
    },
  ],
  23054: [
    {
      school_code: 1286,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2145,
      school: "Grapeview Elementary & Middle School",
      is_district_office: false,
    },
  ],
  23309: [
    {
      school_code: 1083,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1888,
      school: "Mason County Detention Center",
      is_district_office: false,
    },
    {
      school_code: 2745,
      school: "Evergreen Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3241,
      school: "Shelton High School",
      is_district_office: false,
    },
    {
      school_code: 3291,
      school: "Bordeaux Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3292,
      school: "Mountain View Elementary",
      is_district_office: false,
    },
    {
      school_code: 4288,
      school: "Choice Middle and High School",
      is_district_office: false,
    },
    {
      school_code: 4363,
      school: "Oakland Bay Junior High School",
      is_district_office: false,
    },
    {
      school_code: 4586,
      school: "Olympic Middle School",
      is_district_office: false,
    },
    {
      school_code: 5548,
      school: "Shelton Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5621,
      school: "Cedar High School",
      is_district_office: false,
    },
  ],
  23311: [
    {
      school_code: 1249,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5444,
      school: "Mary M. Knight School",
      is_district_office: false,
    },
    {
      school_code: 5445,
      school: "Washington Connections Academy",
      is_district_office: false,
    },
  ],
  23402: [
    {
      school_code: 1287,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2865,
      school: "Pioneer Middle School",
      is_district_office: false,
    },
    {
      school_code: 4463,
      school: "Pioneer Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5704,
      school: "Pioneer Virtual Academy",
      is_district_office: false,
    },
  ],
  23403: [
    {
      school_code: 1149,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1680,
      school: "James A. Taylor High School",
      is_district_office: false,
    },
    {
      school_code: 1861,
      school: "North Mason Homelink Program",
      is_district_office: false,
    },
    {
      school_code: 2662,
      school: "Belfair Elementary",
      is_district_office: false,
    },
    {
      school_code: 3174,
      school: "Hawkins Middle School",
      is_district_office: false,
    },
    {
      school_code: 3175,
      school: "North Mason Senior High School",
      is_district_office: false,
    },
    {
      school_code: 4320,
      school: "Sand Hill Elementary",
      is_district_office: false,
    },
    {
      school_code: 5513,
      school: "Mary E. Theler Early Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5651,
      school: "North Mason Online",
      is_district_office: false,
    },
  ],
  23404: [
    {
      school_code: 1256,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2310,
      school: "Hood Canal Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5515,
      school: "Hood Canal Middle School",
      is_district_office: false,
    },
  ],
  24014: [
    {
      school_code: 1288,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2494,
      school: "Nespelem Elementary",
      is_district_office: false,
    },
    {
      school_code: 5740,
      school: "Nespelem High School",
      is_district_office: false,
    },
  ],
  24019: [
    {
      school_code: 1095,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2031,
      school: "Omak High School",
      is_district_office: false,
    },
    {
      school_code: 2999,
      school: "N Omak Elementary",
      is_district_office: false,
    },
    {
      school_code: 3051,
      school: "E Omak Elementary",
      is_district_office: false,
    },
    {
      school_code: 4237,
      school: "Omak Middle School",
      is_district_office: false,
    },
    {
      school_code: 4278,
      school: "Paschal Sherman",
      is_district_office: false,
    },
    {
      school_code: 4279,
      school: "Highlands High School",
      is_district_office: false,
    },
    {
      school_code: 5195,
      school: "Washington Virtual Academy Omak Elementary",
      is_district_office: false,
    },
    {
      school_code: 5196,
      school: "Washington Virtual Academy Omak Middle School",
      is_district_office: false,
    },
    {
      school_code: 5197,
      school: "Washington Virtual Academy Omak High School",
      is_district_office: false,
    },
    {
      school_code: 5746,
      school: "Highlands",
      is_district_office: false,
    },
  ],
  24105: [
    {
      school_code: 1134,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1980,
      school: "Okanogan Alternative High School",
      is_district_office: false,
    },
    {
      school_code: 2245,
      school: "Okanogan Middle School",
      is_district_office: false,
    },
    {
      school_code: 2246,
      school: "Okanogan High School",
      is_district_office: false,
    },
    {
      school_code: 2539,
      school: "Grainger Elementary",
      is_district_office: false,
    },
    {
      school_code: 3193,
      school: "Okanogan Co Juvenile Detention",
      is_district_office: false,
    },
    {
      school_code: 5151,
      school: "Okanogan Outreach Alternative School",
      is_district_office: false,
    },
  ],
  24111: [
    {
      school_code: 1160,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2800,
      school: "Brewster High School",
      is_district_office: false,
    },
    {
      school_code: 3293,
      school: "Brewster Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4223,
      school: "Brewster Middle School",
      is_district_office: false,
    },
    {
      school_code: 5272,
      school: "Brewster Alternative School",
      is_district_office: false,
    },
  ],
  24122: [
    {
      school_code: 1195,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2396,
      school: "Pateros Elementary",
      is_district_office: false,
    },
    {
      school_code: 2397,
      school: "Pateros High School",
      is_district_office: false,
    },
    {
      school_code: 5639,
      school: "Pateros Alternative School",
      is_district_office: false,
    },
  ],
  24350: [
    {
      school_code: 1196,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1621,
      school: "ILC Choice School",
      is_district_office: false,
    },
    {
      school_code: 1845,
      school: "Home School Experience",
      is_district_office: false,
    },
    {
      school_code: 2146,
      school: "Liberty Bell Jr Sr High",
      is_district_office: false,
    },
    {
      school_code: 4501,
      school: "Methow Valley Elementary",
      is_district_office: false,
    },
  ],
  24404: [
    {
      school_code: 1136,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2679,
      school: "Tonasket High School",
      is_district_office: false,
    },
    {
      school_code: 3176,
      school: "Tonasket Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4196,
      school: "Tonasket Middle School",
      is_district_office: false,
    },
    {
      school_code: 5586,
      school: "Tonasket Choice High School",
      is_district_office: false,
    },
    {
      school_code: 5587,
      school: "Tonasket Outreach School",
      is_district_office: false,
    },
  ],
  24410: [
    {
      school_code: 1096,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2422,
      school: "Oroville Elementary",
      is_district_office: false,
    },
    {
      school_code: 2706,
      school: "Oroville Middle-High School",
      is_district_office: false,
    },
  ],
  24915: [
    {
      school_code: 1366,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5756,
      school: "Paschal Sherman Tribal",
      is_district_office: false,
    },
  ],
  25101: [
    {
      school_code: 1141,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2517,
      school: "Hilltop School",
      is_district_office: false,
    },
    {
      school_code: 3531,
      school: "Long Beach Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4039,
      school: "Ocean Park Elementary",
      is_district_office: false,
    },
    {
      school_code: 4220,
      school: "Ilwaco High School",
      is_district_office: false,
    },
    {
      school_code: 5179,
      school: "Ocean Beach Early Childhood Center",
      is_district_office: false,
    },
    {
      school_code: 5454,
      school: "Ocean Beach Alternative School",
      is_district_office: false,
    },
    {
      school_code: 5647,
      school: "Ocean Beach Alternative School",
      is_district_office: false,
    },
  ],
  25116: [
    {
      school_code: 1115,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1672,
      school: "Developmental Preschool",
      is_district_office: false,
    },
    {
      school_code: 1902,
      school: "Raymond Home Link School",
      is_district_office: false,
    },
    {
      school_code: 2357,
      school: "Raymond Jr Sr High School",
      is_district_office: false,
    },
    {
      school_code: 2803,
      school: "Raymond Elementary School",
      is_district_office: false,
    },
  ],
  25118: [
    {
      school_code: 1172,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2214,
      school: "South Bend High School",
      is_district_office: false,
    },
    {
      school_code: 2804,
      school: "Mike Morris Elementary",
      is_district_office: false,
    },
    {
      school_code: 5243,
      school: "Pacific Virtual Learning",
      is_district_office: false,
    },
    {
      school_code: 5247,
      school: "Pacific County Jail",
      is_district_office: false,
    },
  ],
  25155: [
    {
      school_code: 1166,
      school: "District Office -  Naselle",
      is_district_office: true,
    },
    {
      school_code: 2868,
      school: "Naselle Elementary",
      is_district_office: false,
    },
    {
      school_code: 3295,
      school: "Naselle Jr Sr High Schools",
      is_district_office: false,
    },
    {
      school_code: 5238,
      school: "Naselle Homelink",
      is_district_office: false,
    },
  ],
  25160: [
    {
      school_code: 1173,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2542,
      school: "Willapa Valley Middle-High",
      is_district_office: false,
    },
    {
      school_code: 3444,
      school: "Willapa Elementary",
      is_district_office: false,
    },
  ],
  25200: [
    {
      school_code: 1250,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2292,
      school: "North River School",
      is_district_office: false,
    },
  ],
  26056: [
    {
      school_code: 1120,
      school: "District Office -  Newport School District 056",
      is_district_office: true,
    },
    {
      school_code: 2518,
      school: "Newport High School",
      is_district_office: false,
    },
    {
      school_code: 3968,
      school: "Sadie Halstead Middle School",
      is_district_office: false,
    },
    {
      school_code: 4478,
      school: "Stratton Elementary",
      is_district_office: false,
    },
    {
      school_code: 5118,
      school: "Pend Oreille River School",
      is_district_office: false,
    },
    {
      school_code: 5681,
      school: "Newport Home Link",
      is_district_office: false,
    },
  ],
  26059: [
    {
      school_code: 1181,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2423,
      school: "Cusick Jr Sr High School",
      is_district_office: false,
    },
    {
      school_code: 2770,
      school: "Bess Herian Elementary",
      is_district_office: false,
    },
    {
      school_code: 5538,
      school: "Home Pride",
      is_district_office: false,
    },
    {
      school_code: 5539,
      school: "Kalispel Language Immersion School",
      is_district_office: false,
    },
  ],
  26070: [
    {
      school_code: 1182,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3497,
      school: "Selkirk Jr-Sr High",
      is_district_office: false,
    },
    {
      school_code: 5075,
      school: "Selkirk Elementary",
      is_district_office: false,
    },
    {
      school_code: 5225,
      school: "Selkirk Middle School",
      is_district_office: false,
    },
    {
      school_code: 5226,
      school: "Selkirk High School",
      is_district_office: false,
    },
  ],
  27001: [
    {
      school_code: 1254,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2040,
      school: "Anderson Island Elementary",
      is_district_office: false,
    },
    {
      school_code: 2237,
      school: "Pioneer Middle",
      is_district_office: false,
    },
    {
      school_code: 3446,
      school: "Cherrydale Elementary",
      is_district_office: false,
    },
    {
      school_code: 3827,
      school: "Saltars Point Elementary",
      is_district_office: false,
    },
    {
      school_code: 4131,
      school: "Steilacoom High",
      is_district_office: false,
    },
    {
      school_code: 4562,
      school: "Chloe Clark Elementary",
      is_district_office: false,
    },
    {
      school_code: 5013,
      school: "Developmental Preschool",
      is_district_office: false,
    },
    {
      school_code: 5389,
      school: "Birth to Three",
      is_district_office: false,
    },
    {
      school_code: 5410,
      school: "Futures Program",
      is_district_office: false,
    },
    {
      school_code: 5527,
      school: "Steilacoom PRIDE Academy",
      is_district_office: false,
    },
  ],
  27003: [
    {
      school_code: 1028,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1640,
      school: "Puyallup Online Academy/POA",
      is_district_office: false,
    },
    {
      school_code: 2125,
      school: "Puyallup High School",
      is_district_office: false,
    },
    {
      school_code: 2311,
      school: "Stewart Elementary",
      is_district_office: false,
    },
    {
      school_code: 2334,
      school: "Meeker Elementary",
      is_district_office: false,
    },
    {
      school_code: 2495,
      school: "Waller Road Elementary",
      is_district_office: false,
    },
    {
      school_code: 2496,
      school: "Firgrove Elementary",
      is_district_office: false,
    },
    {
      school_code: 2497,
      school: "Spinning Elementary",
      is_district_office: false,
    },
    {
      school_code: 2498,
      school: "Maplewood Elementary",
      is_district_office: false,
    },
    {
      school_code: 2519,
      school: "Woodland Elementary",
      is_district_office: false,
    },
    {
      school_code: 2575,
      school: "Edgemont Jr High",
      is_district_office: false,
    },
    {
      school_code: 2870,
      school: "Karshner Elementary",
      is_district_office: false,
    },
    {
      school_code: 3052,
      school: "Kalles Junior High",
      is_district_office: false,
    },
    {
      school_code: 3114,
      school: "Riverside Elementary",
      is_district_office: false,
    },
    {
      school_code: 3115,
      school: "Hilltop Elementary",
      is_district_office: false,
    },
    {
      school_code: 3447,
      school: "Aylen Jr High",
      is_district_office: false,
    },
    {
      school_code: 3557,
      school: "Fruitland Elementary",
      is_district_office: false,
    },
    {
      school_code: 3558,
      school: "Wildwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 3572,
      school: "Mt View Elementary",
      is_district_office: false,
    },
    {
      school_code: 3645,
      school: "Rogers High School",
      is_district_office: false,
    },
    {
      school_code: 3750,
      school: "Ballou Jr High",
      is_district_office: false,
    },
    {
      school_code: 3896,
      school: "Sunrise Elementary",
      is_district_office: false,
    },
    {
      school_code: 3927,
      school: "Northwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 3951,
      school: "PSD Special Services",
      is_district_office: false,
    },
    {
      school_code: 3972,
      school: "Walker High School",
      is_district_office: false,
    },
    {
      school_code: 4110,
      school: "Chief Leschi Schools",
      is_district_office: false,
    },
    {
      school_code: 4121,
      school: "Ridgecrest Elementary",
      is_district_office: false,
    },
    {
      school_code: 4496,
      school: "Zeiger Elementary",
      is_district_office: false,
    },
    {
      school_code: 4146,
      school: "Pope Elementary",
      is_district_office: false,
    },
    {
      school_code: 4183,
      school: "Ferrucci Jr High",
      is_district_office: false,
    },
    {
      school_code: 4360,
      school: "Hunt Elementary",
      is_district_office: false,
    },
    {
      school_code: 4361,
      school: "Brouillet Elementary",
      is_district_office: false,
    },
    {
      school_code: 4414,
      school: "Shaw Road Elementary",
      is_district_office: false,
    },
    {
      school_code: 4443,
      school: "Stahl Junior High",
      is_district_office: false,
    },
    {
      school_code: 4540,
      school: "Emerald Ridge High School",
      is_district_office: false,
    },
    {
      school_code: 5073,
      school: "Quest",
      is_district_office: false,
    },
    {
      school_code: 5088,
      school: "Carson Elementary",
      is_district_office: false,
    },
    {
      school_code: 5093,
      school: "Edgerton Elementary",
      is_district_office: false,
    },
    {
      school_code: 5142,
      school: "Glacier View Junior High",
      is_district_office: false,
    },
    {
      school_code: 5321,
      school: "Puyallup Open Doors/POD",
      is_district_office: false,
    },
    {
      school_code: 5322,
      school: "Puyallup Parent Partnership Program",
      is_district_office: false,
    },
    {
      school_code: 5557,
      school: "Dessie F Evans Elementary",
      is_district_office: false,
    },
  ],
  27010: [
    {
      school_code: 2376,
      school: "Mason",
      is_district_office: false,
    },
    {
      school_code: 2871,
      school: "Edison",
      is_district_office: false,
    },
    {
      school_code: 2938,
      school: "Sherman",
      is_district_office: false,
    },
    {
      school_code: 3646,
      school: "Boze",
      is_district_office: false,
    },
    {
      school_code: 2336,
      school: "Lyon",
      is_district_office: false,
    },
    {
      school_code: 2746,
      school: "Geiger",
      is_district_office: false,
    },
    {
      school_code: 1005,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1514,
      school: "Alternative Spcl Needs Div Occ",
      is_district_office: false,
    },
    {
      school_code: 1585,
      school: "Comm Based Trans Program",
      is_district_office: false,
    },
    {
      school_code: 1797,
      school: "Day Reporting School",
      is_district_office: false,
    },
    {
      school_code: 1860,
      school: "Tacoma School of the Arts",
      is_district_office: false,
    },
    {
      school_code: 2036,
      school: "Larchmont",
      is_district_office: false,
    },
    {
      school_code: 2039,
      school: "Remann Hall Juvenile Detention Center",
      is_district_office: false,
    },
    {
      school_code: 2083,
      school: "Washington Elementary",
      is_district_office: false,
    },
    {
      school_code: 2084,
      school: "Stadium",
      is_district_office: false,
    },
    {
      school_code: 2094,
      school: "Blix Elementary",
      is_district_office: false,
    },
    {
      school_code: 2103,
      school: "Jefferson",
      is_district_office: false,
    },
    {
      school_code: 2148,
      school: "Franklin",
      is_district_office: false,
    },
    {
      school_code: 2167,
      school: "Fern Hill",
      is_district_office: false,
    },
    {
      school_code: 2168,
      school: "Sheridan",
      is_district_office: false,
    },
    {
      school_code: 2169,
      school: "Point Defiance",
      is_district_office: false,
    },
    {
      school_code: 2215,
      school: "Lincoln",
      is_district_office: false,
    },
    {
      school_code: 2247,
      school: "Northeast Tacoma",
      is_district_office: false,
    },
    {
      school_code: 2252,
      school: "Manitou Park",
      is_district_office: false,
    },
    {
      school_code: 2275,
      school: "Roosevelt",
      is_district_office: false,
    },
    {
      school_code: 2335,
      school: "Madison Headstart",
      is_district_office: false,
    },
    {
      school_code: 2338,
      school: "Jason Lee",
      is_district_office: false,
    },
    {
      school_code: 2358,
      school: "Stanley",
      is_district_office: false,
    },
    {
      school_code: 2359,
      school: "Stewart",
      is_district_office: false,
    },
    {
      school_code: 2377,
      school: "Gray",
      is_district_office: false,
    },
    {
      school_code: 2747,
      school: "Downing",
      is_district_office: false,
    },
    {
      school_code: 2771,
      school: "Lister",
      is_district_office: false,
    },
    {
      school_code: 2772,
      school: "Fawcett",
      is_district_office: false,
    },
    {
      school_code: 2805,
      school: "Lowell",
      is_district_office: false,
    },
    {
      school_code: 2806,
      school: "Reed",
      is_district_office: false,
    },
    {
      school_code: 2872,
      school: "Browns Point",
      is_district_office: false,
    },
    {
      school_code: 2874,
      school: "Whitman",
      is_district_office: false,
    },
    {
      school_code: 2939,
      school: "Delong",
      is_district_office: false,
    },
    {
      school_code: 2940,
      school: "Arlington",
      is_district_office: false,
    },
    {
      school_code: 2941,
      school: "Mann",
      is_district_office: false,
    },
    {
      school_code: 3053,
      school: "Grant",
      is_district_office: false,
    },
    {
      school_code: 3054,
      school: "Baker",
      is_district_office: false,
    },
    {
      school_code: 3116,
      school: "Wainwright",
      is_district_office: false,
    },
    {
      school_code: 3244,
      school: "Meeker",
      is_district_office: false,
    },
    {
      school_code: 3246,
      school: "Wilson",
      is_district_office: false,
    },
    {
      school_code: 3397,
      school: "Bryant",
      is_district_office: false,
    },
    {
      school_code: 3398,
      school: "Mt Tahoma",
      is_district_office: false,
    },
    {
      school_code: 3448,
      school: "Truman",
      is_district_office: false,
    },
    {
      school_code: 3449,
      school: "Birney",
      is_district_office: false,
    },
    {
      school_code: 3452,
      school: "Whittier",
      is_district_office: false,
    },
    {
      school_code: 3453,
      school: "McCarver",
      is_district_office: false,
    },
    {
      school_code: 3498,
      school: "Skyline",
      is_district_office: false,
    },
    {
      school_code: 3880,
      school: "Foss",
      is_district_office: false,
    },
    {
      school_code: 4109,
      school: "Oakland High School",
      is_district_office: false,
    },
    {
      school_code: 4283,
      school: "Pearl Street Center",
      is_district_office: false,
    },
    {
      school_code: 4537,
      school: "Crescent Heights",
      is_district_office: false,
    },
    {
      school_code: 4575,
      school: "Angelo Giaudrone Middle School",
      is_district_office: false,
    },
    {
      school_code: 5066,
      school: "Helen B. Stafford Elementary",
      is_district_office: false,
    },
    {
      school_code: 5169,
      school: "Science and Math Institute",
      is_district_office: false,
    },
    {
      school_code: 5170,
      school: "First Creek Middle School",
      is_district_office: false,
    },
    {
      school_code: 5184,
      school: "Tacoma Pierce County Education Center",
      is_district_office: false,
    },
    {
      school_code: 5192,
      school: "Special Services",
      is_district_office: false,
    },
    {
      school_code: 5307,
      school: "Tacoma Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5320,
      school: "Willie Stewart Academy",
      is_district_office: false,
    },
    {
      school_code: 5327,
      school: "Goodwill GED",
      is_district_office: false,
    },
    {
      school_code: 5458,
      school: "Industrial Design Engineering and Art",
      is_district_office: false,
    },
    {
      school_code: 5459,
      school: "Hoyt Early Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5568,
      school: "Willard Early Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5627,
      school: "Bryant Montessori Middle School",
      is_district_office: false,
    },
    {
      school_code: 5697,
      school: "Hunt Middle School",
      is_district_office: false,
    },
    {
      school_code: 5720,
      school: "Tacoma Online Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5721,
      school: "Tacoma Online Middle School",
      is_district_office: false,
    },
    {
      school_code: 5722,
      school: "Tacoma Online High School",
      is_district_office: false,
    },
  ],
  27019: [
    {
      school_code: 1289,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2466,
      school: "Carbonado Historical School 19",
      is_district_office: false,
    },
  ],
  27083: [
    {
      school_code: 1059,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1790,
      school: "University Place Special Educ",
      is_district_office: false,
    },
    {
      school_code: 2223,
      school: "University Place Primary",
      is_district_office: false,
    },
    {
      school_code: 3179,
      school: "Curtis Junior High",
      is_district_office: false,
    },
    {
      school_code: 3296,
      school: "Narrows View Intermediate",
      is_district_office: false,
    },
    {
      school_code: 3600,
      school: "Curtis Senior High",
      is_district_office: false,
    },
    {
      school_code: 3601,
      school: "Sunset Primary",
      is_district_office: false,
    },
    {
      school_code: 3792,
      school: "Chambers Elementary",
      is_district_office: false,
    },
    {
      school_code: 4325,
      school: "Drum Intermediate",
      is_district_office: false,
    },
    {
      school_code: 4447,
      school: "Evergreen Primary",
      is_district_office: false,
    },
    {
      school_code: 5353,
      school: "CHS Drop-Out Reengagement Program",
      is_district_office: false,
    },
  ],
  27320: [
    {
      school_code: 1060,
      school: "District Office -  Sumner",
      is_district_office: true,
    },
    {
      school_code: 1781,
      school: "Sumner Special Services",
      is_district_office: false,
    },
    {
      school_code: 2875,
      school: "Maple Lawn Elementary",
      is_district_office: false,
    },
    {
      school_code: 3247,
      school: "Sumner High School",
      is_district_office: false,
    },
    {
      school_code: 3349,
      school: "Bonney Lake Elementary",
      is_district_office: false,
    },
    {
      school_code: 3399,
      school: "Eismann Elementary",
      is_district_office: false,
    },
    {
      school_code: 3499,
      school: "Sumner Middle School",
      is_district_office: false,
    },
    {
      school_code: 4132,
      school: "Lakeridge Middle School",
      is_district_office: false,
    },
    {
      school_code: 4166,
      school: "Victor Falls Elementary",
      is_district_office: false,
    },
    {
      school_code: 4250,
      school: "Emerald Hills Elementary",
      is_district_office: false,
    },
    {
      school_code: 4402,
      school: "Liberty Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 4435,
      school: "Crestwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 4502,
      school: "Mountain View Middle School",
      is_district_office: false,
    },
    {
      school_code: 4541,
      school: "Daffodil Valley Elementary",
      is_district_office: false,
    },
    {
      school_code: 4585,
      school: "Bonney Lake High School",
      is_district_office: false,
    },
    {
      school_code: 5524,
      school: "Tehaleh Heights Elementary",
      is_district_office: false,
    },
  ],
  27343: [
    {
      school_code: 1257,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3683,
      school: "Lake Tapps Elementary",
      is_district_office: false,
    },
    {
      school_code: 4416,
      school: "North Tapps Middle School",
      is_district_office: false,
    },
    {
      school_code: 4548,
      school: "Dieringer Heights Elementary",
      is_district_office: false,
    },
  ],
  27344: [
    {
      school_code: 1139,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2360,
      school: "Orting Primary School",
      is_district_office: false,
    },
    {
      school_code: 2942,
      school: "Orting High School",
      is_district_office: false,
    },
    {
      school_code: 4262,
      school: "Orting Middle School",
      is_district_office: false,
    },
    {
      school_code: 4547,
      school: "Ptarmigan Ridge Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5011,
      school: "Orting Special Education",
      is_district_office: false,
    },
    {
      school_code: 5656,
      school: "Orting Elementary Online Academy",
      is_district_office: false,
    },
    {
      school_code: 5657,
      school: "Orting Secondary Online Academy",
      is_district_office: false,
    },
  ],
  27400: [
    {
      school_code: 1013,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1825,
      school: "Alfaretta House",
      is_district_office: false,
    },
    {
      school_code: 1880,
      school: "Re-Entry High School",
      is_district_office: false,
    },
    {
      school_code: 1881,
      school: "Re-Entry Middle School",
      is_district_office: false,
    },
    {
      school_code: 1882,
      school: "Special Education Services/relife",
      is_district_office: false,
    },
    {
      school_code: 2041,
      school: "Firwood",
      is_district_office: false,
    },
    {
      school_code: 2189,
      school: "Park Lodge Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2425,
      school: "Clover Park High School",
      is_district_office: false,
    },
    {
      school_code: 2651,
      school: "Tillicum Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2652,
      school: "Lakeview Hope Academy",
      is_district_office: false,
    },
    {
      school_code: 2943,
      school: "Custer Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3117,
      school: "Idlewild Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3248,
      school: "Hudtloff Middle School",
      is_district_office: false,
    },
    {
      school_code: 3249,
      school: "Tyee Park Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3297,
      school: "Mann Middle School",
      is_district_office: false,
    },
    {
      school_code: 3298,
      school: "Hillside Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3351,
      school: "Lake Louise Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3454,
      school: "Beachwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3455,
      school: "Dower Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3456,
      school: "Lakes High School",
      is_district_office: false,
    },
    {
      school_code: 3457,
      school: "Carter Lake Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3500,
      school: "Thomas Middle School",
      is_district_office: false,
    },
    {
      school_code: 3602,
      school: "Lochburn Middle School",
      is_district_office: false,
    },
    {
      school_code: 3763,
      school: "Oakbrook Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3910,
      school: "Oak Grove",
      is_district_office: false,
    },
    {
      school_code: 4396,
      school: "Evergreen Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5027,
      school: "Harrison Prep School",
      is_district_office: false,
    },
    {
      school_code: 5297,
      school: "Transition Day Students",
      is_district_office: false,
    },
    {
      school_code: 5298,
      school: "Oakridge Group Home",
      is_district_office: false,
    },
    {
      school_code: 5364,
      school: "Meriwether Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5365,
      school: "Rainier Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5386,
      school: "Clover Park Early Learning Program",
      is_district_office: false,
    },
    {
      school_code: 5387,
      school: "Four Heroes Elementary",
      is_district_office: false,
    },
    {
      school_code: 5411,
      school: "CPSD Open Doors Program",
      is_district_office: false,
    },
    {
      school_code: 5751,
      school: "Gravelly Lake K-12 Academy",
      is_district_office: false,
    },
  ],
  27401: [
    {
      school_code: 1061,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1516,
      school: "Henderson Bay Alt High School",
      is_district_office: false,
    },
    {
      school_code: 2294,
      school: "Goodman Middle School",
      is_district_office: false,
    },
    {
      school_code: 2681,
      school: "Peninsula High School",
      is_district_office: false,
    },
    {
      school_code: 2944,
      school: "Harbor Heights Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3055,
      school: "Evergreen Elementary",
      is_district_office: false,
    },
    {
      school_code: 3056,
      school: "Vaughn Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3299,
      school: "Artondale Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3685,
      school: "Purdy Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4080,
      school: "Discovery Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4081,
      school: "Gig Harbor High",
      is_district_office: false,
    },
    {
      school_code: 4156,
      school: "Key Peninsula Middle School",
      is_district_office: false,
    },
    {
      school_code: 4189,
      school: "Minter Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 4219,
      school: "Kopachuck Middle School",
      is_district_office: false,
    },
    {
      school_code: 4307,
      school: "Voyager Elementary",
      is_district_office: false,
    },
    {
      school_code: 4387,
      school: "Harbor Ridge Middle School",
      is_district_office: false,
    },
    {
      school_code: 5631,
      school: "Pioneer Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5632,
      school: "Peninsula Alternative Programs",
      is_district_office: false,
    },
    {
      school_code: 5685,
      school: "Swift Water Elementary",
      is_district_office: false,
    },
  ],
  27402: [
    {
      school_code: 1029,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2257,
      school: "Collins Elementary",
      is_district_office: false,
    },
    {
      school_code: 2340,
      school: "Midland Elementary",
      is_district_office: false,
    },
    {
      school_code: 2398,
      school: "Central Avenue Elementary",
      is_district_office: false,
    },
    {
      school_code: 2876,
      school: "Franklin Pierce High School",
      is_district_office: false,
    },
    {
      school_code: 2945,
      school: "James Sales Elementary",
      is_district_office: false,
    },
    {
      school_code: 3000,
      school: "Harvard Elementary",
      is_district_office: false,
    },
    {
      school_code: 3180,
      school: "Brookdale Elementary",
      is_district_office: false,
    },
    {
      school_code: 3300,
      school: "Morris Ford Middle School",
      is_district_office: false,
    },
    {
      school_code: 3301,
      school: "Christensen Elementary",
      is_district_office: false,
    },
    {
      school_code: 3401,
      school: "Perry G Keithley Middle School",
      is_district_office: false,
    },
    {
      school_code: 3532,
      school: "Elmhurst Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3648,
      school: "Washington High School",
      is_district_office: false,
    },
    {
      school_code: 4063,
      school: "Gates Secondary School",
      is_district_office: false,
    },
    {
      school_code: 5129,
      school: "Learning Support",
      is_district_office: false,
    },
    {
      school_code: 5436,
      school: "Early Learning Center",
      is_district_office: false,
    },
  ],
  27403: [
    {
      school_code: 2543,
      school: "Roy Elementary",
      is_district_office: false,
    },
    {
      school_code: 1062,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1510,
      school: "Challenger High School",
      is_district_office: false,
    },
    {
      school_code: 1560,
      school: "Thompson Preschool",
      is_district_office: false,
    },
    {
      school_code: 1943,
      school: "Pioneer Valley Preschool",
      is_district_office: false,
    },
    {
      school_code: 1945,
      school: "Elk Plain Head Start",
      is_district_office: false,
    },
    {
      school_code: 2399,
      school: "Spanaway Elementary",
      is_district_office: false,
    },
    {
      school_code: 2576,
      school: "Clover Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 2748,
      school: "Kapowsin Elementary",
      is_district_office: false,
    },
    {
      school_code: 2807,
      school: "Bethel High School",
      is_district_office: false,
    },
    {
      school_code: 2877,
      school: "Elk Plain School of Choice",
      is_district_office: false,
    },
    {
      school_code: 3250,
      school: "Bethel Middle School",
      is_district_office: false,
    },
    {
      school_code: 3649,
      school: "Chester H Thompson Elementary",
      is_district_office: false,
    },
    {
      school_code: 3751,
      school: "Spanaway Middle School",
      is_district_office: false,
    },
    {
      school_code: 4099,
      school: "Evergreen Elementary",
      is_district_office: false,
    },
    {
      school_code: 4102,
      school: "Naches Trail Elementary",
      is_district_office: false,
    },
    {
      school_code: 4103,
      school: "Shining Mountain Elementary",
      is_district_office: false,
    },
    {
      school_code: 4158,
      school: "Spanaway Lake High School",
      is_district_office: false,
    },
    {
      school_code: 4186,
      school: "Cedarcrest Middle School",
      is_district_office: false,
    },
    {
      school_code: 4227,
      school: "Rocky Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 4296,
      school: "Camas Prairie Elementary",
      is_district_office: false,
    },
    {
      school_code: 4297,
      school: "Graham Elementary",
      is_district_office: false,
    },
    {
      school_code: 4331,
      school: "Centennial Elementary Bethel",
      is_district_office: false,
    },
    {
      school_code: 4381,
      school: "Pioneer Valley Elementary",
      is_district_office: false,
    },
    {
      school_code: 4407,
      school: "Frontier Middle School",
      is_district_office: false,
    },
    {
      school_code: 4538,
      school: "North Star Elementary",
      is_district_office: false,
    },
    {
      school_code: 4578,
      school: "Cougar Mountain Middle School",
      is_district_office: false,
    },
    {
      school_code: 5033,
      school: "Graham Kapowsin High School",
      is_district_office: false,
    },
    {
      school_code: 5141,
      school: "Spanaway Elementary Preschool",
      is_district_office: false,
    },
    {
      school_code: 5159,
      school: "Frederickson Elementary",
      is_district_office: false,
    },
    {
      school_code: 5160,
      school: "Nelson Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5206,
      school: "Liberty Middle School",
      is_district_office: false,
    },
    {
      school_code: 5216,
      school: "Bethel Elementary Learning Academy",
      is_district_office: false,
    },
    {
      school_code: 5288,
      school: "Birth to Three",
      is_district_office: false,
    },
    {
      school_code: 5372,
      school: "Acceleration Academy",
      is_district_office: false,
    },
    {
      school_code: 5471,
      school: "Bethel Elementary Learning Academy",
      is_district_office: false,
    },
    {
      school_code: 5633,
      school: "Bethel Virtual Academy",
      is_district_office: false,
    },
    {
      school_code: 5635,
      school: "Katherine G. Johnson Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5665,
      school: "Pre-Primary School",
      is_district_office: false,
    },
    {
      school_code: 5737,
      school: "Naches Trail Preschool",
      is_district_office: false,
    },
    {
      school_code: 5754,
      school: "Transition 18-21 Program",
      is_district_office: false,
    },
    {
      school_code: 5961,
      school: "Pierce County Skills Center",
      is_district_office: false,
    },
  ],
  27404: [
    {
      school_code: 1106,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2205,
      school: "Eatonville Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2206,
      school: "Eatonville High School",
      is_district_office: false,
    },
    {
      school_code: 2361,
      school: "Weyerhaeuser Elementary",
      is_district_office: false,
    },
    {
      school_code: 2808,
      school: "Columbia Crest A-STEM Academy",
      is_district_office: false,
    },
    {
      school_code: 4230,
      school: "Eatonville Middle School",
      is_district_office: false,
    },
    {
      school_code: 5079,
      school: "Eatonville Developmental Pre-School",
      is_district_office: false,
    },
    {
      school_code: 5300,
      school: "Mt. Rainier Parent Partnership",
      is_district_office: false,
    },
    {
      school_code: 5332,
      school: "New Beginnings",
      is_district_office: false,
    },
    {
      school_code: 5531,
      school: "Eatonville Online Academy",
      is_district_office: false,
    },
  ],
  27416: [
    {
      school_code: 1107,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2190,
      school: "Elk Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 3458,
      school: "Glacier Middle School",
      is_district_office: false,
    },
    {
      school_code: 4170,
      school: "Wilkeson Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4309,
      school: "Foothills Elementary",
      is_district_office: false,
    },
    {
      school_code: 4471,
      school: "Mountain Meadow Elementary",
      is_district_office: false,
    },
    {
      school_code: 4569,
      school: "White River High School",
      is_district_office: false,
    },
    {
      school_code: 5045,
      school: "White River Special Ed Services",
      is_district_office: false,
    },
    {
      school_code: 5338,
      school: "White River Reengagement Program",
      is_district_office: false,
    },
    {
      school_code: 5390,
      school: "White River Homeschool",
      is_district_office: false,
    },
    {
      school_code: 5564,
      school: "White River Early Learning Center",
      is_district_office: false,
    },
  ],
  27417: [
    {
      school_code: 1081,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2773,
      school: "Fife High School",
      is_district_office: false,
    },
    {
      school_code: 2809,
      school: "Endeavour Intermediate",
      is_district_office: false,
    },
    {
      school_code: 2878,
      school: "Discovery Primary School",
      is_district_office: false,
    },
    {
      school_code: 3798,
      school: "Surprise Lake Middle School",
      is_district_office: false,
    },
    {
      school_code: 4557,
      school: "Hedden Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4582,
      school: "Columbia Junior High School",
      is_district_office: false,
    },
    {
      school_code: 5582,
      school: "Fife Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5671,
      school: "Fife Elementary School",
      is_district_office: false,
    },
  ],
  27901: [
    {
      school_code: 1312,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5549,
      school: "Chief Leschi Schools",
      is_district_office: false,
    },
  ],
  27902: [
    {
      school_code: 1363,
      school: "District Office -  Impact-",
      is_district_office: true,
    },
    {
      school_code: 5661,
      school: "Impact Public Schools",
      is_district_office: false,
    },
  ],
  27904: [
    {
      school_code: 5378,
      school: "Destiny Middle School",
      is_district_office: false,
    },
  ],
  27905: [
    {
      school_code: 1346,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5376,
      school: "Summit Public School: Olympus",
      is_district_office: false,
    },
  ],
  27909: [
    {
      school_code: 5379,
      school: "SOAR Academy Public Charter School",
      is_district_office: false,
    },
  ],
  27931: [
    {
      school_code: 5431,
      school: "Bates Technical College - Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5950,
      school: "Bates Technical High School",
      is_district_office: false,
    },
  ],
  27932: [
    {
      school_code: 5951,
      school: "Northwest Career and Technical High School",
      is_district_office: false,
    },
  ],
  28010: [
    {
      school_code: 1290,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3725,
      school: "Shaw Island Elementary School",
      is_district_office: false,
    },
  ],
  28137: [
    {
      school_code: 1335,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1892,
      school: "OASIS K-12",
      is_district_office: false,
    },
    {
      school_code: 2749,
      school: "Orcas Island Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2750,
      school: "Orcas Island High School",
      is_district_office: false,
    },
    {
      school_code: 3808,
      school: "Waldron Island School",
      is_district_office: false,
    },
    {
      school_code: 4558,
      school: "Orcas Island Middle School",
      is_district_office: false,
    },
    {
      school_code: 5555,
      school: "Orcas Island Montessori Public",
      is_district_office: false,
    },
  ],
  28144: [
    {
      school_code: 1241,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2632,
      school: "Lopez Middle High School",
      is_district_office: false,
    },
    {
      school_code: 4107,
      school: "Lopez Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4178,
      school: "Decatur Elementary",
      is_district_office: false,
    },
    {
      school_code: 5299,
      school: "CVA-Lopez Island",
      is_district_office: false,
    },
  ],
  28149: [
    {
      school_code: 1197,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1963,
      school: "Griffin Bay School",
      is_district_office: false,
    },
    {
      school_code: 2520,
      school: "Friday Harbor Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2879,
      school: "Friday Harbor High School",
      is_district_office: false,
    },
    {
      school_code: 3011,
      school: "Friday Harbor Middle School",
      is_district_office: false,
    },
    {
      school_code: 5559,
      school: "Griffin Bay School Open Doors",
      is_district_office: false,
    },
  ],
  29011: [
    {
      school_code: 1162,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1605,
      school: "Twin Cedars High School",
      is_district_office: false,
    },
    {
      school_code: 1762,
      school: "Skagit River School House",
      is_district_office: false,
    },
    {
      school_code: 2577,
      school: "Concrete Elementary",
      is_district_office: false,
    },
    {
      school_code: 2810,
      school: "Concrete High School",
      is_district_office: false,
    },
    {
      school_code: 5087,
      school: "Special Services School",
      is_district_office: false,
    },
  ],
  29100: [
    {
      school_code: 1052,
      school: "District Office -  Burlington",
      is_district_office: true,
    },
    {
      school_code: 1650,
      school: "BECC",
      is_district_office: false,
    },
    {
      school_code: 1928,
      school: "Burlington-Edison Alternative School",
      is_district_office: false,
    },
    {
      school_code: 2362,
      school: "Burlington Edison High School",
      is_district_office: false,
    },
    {
      school_code: 2379,
      school: "Edison Elementary - Burlington/Edison",
      is_district_office: false,
    },
    {
      school_code: 2946,
      school: "West View Elementary",
      is_district_office: false,
    },
    {
      school_code: 3251,
      school: "Lucille Umbarger Elementary",
      is_district_office: false,
    },
    {
      school_code: 3603,
      school: "Allen Elementary",
      is_district_office: false,
    },
    {
      school_code: 4412,
      school: "Bay View Elementary",
      is_district_office: false,
    },
    {
      school_code: 5525,
      school: "Open Doors",
      is_district_office: false,
    },
  ],
  29101: [
    {
      school_code: 1053,
      school: "District Office -  Sedro",
      is_district_office: true,
    },
    {
      school_code: 1537,
      school: "State Street High School",
      is_district_office: false,
    },
    {
      school_code: 2150,
      school: "Sedro Woolley Senior High School",
      is_district_office: false,
    },
    {
      school_code: 2380,
      school: "Central Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2521,
      school: "Big Lake Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2620,
      school: "Lyman Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2774,
      school: "Mary Purcell Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3181,
      school: "Cascade Middle School",
      is_district_office: false,
    },
    {
      school_code: 3402,
      school: "Samish Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3403,
      school: "Clear Lake Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3942,
      school: "Evergreen Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5058,
      school: "Good Beginnings Center",
      is_district_office: false,
    },
    {
      school_code: 5456,
      school: "Connections Academy",
      is_district_office: false,
    },
    {
      school_code: 5692,
      school: "Sedro-Woolley Virtual Learning Academy",
      is_district_office: false,
    },
  ],
  29103: [
    {
      school_code: 1054,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1905,
      school: "Cooperatives",
      is_district_office: false,
    },
    {
      school_code: 2467,
      school: "Anacortes High School",
      is_district_office: false,
    },
    {
      school_code: 2707,
      school: "Anacortes Middle School",
      is_district_office: false,
    },
    {
      school_code: 3057,
      school: "Mount Erie Elementary",
      is_district_office: false,
    },
    {
      school_code: 3182,
      school: "Fidalgo Elementary",
      is_district_office: false,
    },
    {
      school_code: 3252,
      school: "Island View Elementary",
      is_district_office: false,
    },
    {
      school_code: 3404,
      school: "Whitney Early Childhood Education Center",
      is_district_office: false,
    },
    {
      school_code: 5176,
      school: "Cap Sante High School",
      is_district_office: false,
    },
    {
      school_code: 5588,
      school: "Open Doors",
      is_district_office: false,
    },
  ],
  29311: [
    {
      school_code: 1198,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2276,
      school: "La Conner High School",
      is_district_office: false,
    },
    {
      school_code: 2522,
      school: "La Conner Elementary",
      is_district_office: false,
    },
    {
      school_code: 3900,
      school: "La Conner Middle",
      is_district_office: false,
    },
  ],
  29317: [
    {
      school_code: 1291,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2578,
      school: "Conway School",
      is_district_office: false,
    },
  ],
  29320: [
    {
      school_code: 1055,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1992,
      school: "Skagit Academy",
      is_district_office: false,
    },
    {
      school_code: 2295,
      school: "Mount Vernon High School",
      is_district_office: false,
    },
    {
      school_code: 2579,
      school: "Lincoln Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2880,
      school: "Washington Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3001,
      school: "Madison Elementary",
      is_district_office: false,
    },
    {
      school_code: 3183,
      school: "Jefferson Elementary",
      is_district_office: false,
    },
    {
      school_code: 3821,
      school: "La Venture Middle School",
      is_district_office: false,
    },
    {
      school_code: 3829,
      school: "Mount Vernon Special Ed",
      is_district_office: false,
    },
    {
      school_code: 4013,
      school: "Little Mountain Elementary",
      is_district_office: false,
    },
    {
      school_code: 4329,
      school: "Centennial Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4511,
      school: "Mount Baker Middle School",
      is_district_office: false,
    },
    {
      school_code: 5449,
      school: "Mount Vernon Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5589,
      school: "Harriet Rowley Elementary",
      is_district_office: false,
    },
    {
      school_code: 5625,
      school: "Aspire Academy",
      is_district_office: false,
    },
    {
      school_code: 5960,
      school: "Northwest Career & Technical Academy",
      is_district_office: false,
    },
  ],
  29801: [
    {
      school_code: 1811,
      school: "Pass Program",
      is_district_office: false,
    },
    {
      school_code: 2601,
      school: "Snohomish Detention Center",
      is_district_office: false,
    },
    {
      school_code: 3363,
      school: "Skagit County Detention Center",
      is_district_office: false,
    },
    {
      school_code: 3420,
      school: "Whatcom Co Detention Ctr",
      is_district_office: false,
    },
    {
      school_code: 5501,
      school: "Open Doors - Youth Reengagement Program",
      is_district_office: false,
    },
  ],
  30002: [
    {
      school_code: 1292,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3405,
      school: "Skamania Elementary",
      is_district_office: false,
    },
  ],
  30029: [
    {
      school_code: 1293,
      school: "District Office -  Mount Pleasant School District 029",
      is_district_office: true,
    },
    {
      school_code: 3459,
      school: "Mount Pleasant School",
      is_district_office: false,
    },
  ],
  30031: [
    {
      school_code: 1294,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3406,
      school: "Mill A Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5480,
      school: "Pacific Crest Innovation Academy",
      is_district_office: false,
    },
  ],
  30303: [
    {
      school_code: 1142,
      school: "District Office -  Stevenson",
      is_district_office: true,
    },
    {
      school_code: 1765,
      school: "Preschool - Stevenson",
      is_district_office: false,
    },
    {
      school_code: 2682,
      school: "Stevenson Elementary - Stevenson",
      is_district_office: false,
    },
    {
      school_code: 2882,
      school: "Carson Elementary - Stevenson",
      is_district_office: false,
    },
    {
      school_code: 3119,
      school: "Stevenson High School - Stevenson",
      is_district_office: false,
    },
    {
      school_code: 3800,
      school: "Wind River Middle School",
      is_district_office: false,
    },
    {
      school_code: 5581,
      school: "Open Doors for SHS - Stevenson",
      is_district_office: false,
    },
  ],
  31002: [
    {
      school_code: 1007,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1907,
      school: "Port Gardner",
      is_district_office: false,
    },
    {
      school_code: 1663,
      school: "NW Learning Center",
      is_district_office: false,
    },
    {
      school_code: 1810,
      school: "Sno Co Jail",
      is_district_office: false,
    },
    {
      school_code: 2065,
      school: "Garfield Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2126,
      school: "Everett High School",
      is_district_office: false,
    },
    {
      school_code: 2364,
      school: "North Middle School",
      is_district_office: false,
    },
    {
      school_code: 2545,
      school: "Silver Lake Elementary - Everett",
      is_district_office: false,
    },
    {
      school_code: 2669,
      school: "Madison Elementary",
      is_district_office: false,
    },
    {
      school_code: 2751,
      school: "Jackson Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2752,
      school: "Whittier Elementary",
      is_district_office: false,
    },
    {
      school_code: 2811,
      school: "Lowell Elementary - Everett",
      is_district_office: false,
    },
    {
      school_code: 2883,
      school: "Hawthorne Elementary School - Everett",
      is_district_office: false,
    },
    {
      school_code: 3002,
      school: "View Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 3184,
      school: "Emerson Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3253,
      school: "Evergreen Middle School",
      is_district_office: false,
    },
    {
      school_code: 3407,
      school: "Cascade High School",
      is_district_office: false,
    },
    {
      school_code: 3533,
      school: "Jefferson Elementary",
      is_district_office: false,
    },
    {
      school_code: 3686,
      school: "Monroe Elementary",
      is_district_office: false,
    },
    {
      school_code: 3752,
      school: "Eisenhower Middle School",
      is_district_office: false,
    },
    {
      school_code: 3903,
      school: "Special Services",
      is_district_office: false,
    },
    {
      school_code: 4125,
      school: "Woodside Elementary",
      is_district_office: false,
    },
    {
      school_code: 4137,
      school: "Sequoia High School",
      is_district_office: false,
    },
    {
      school_code: 4298,
      school: "Silver Firs Elementary",
      is_district_office: false,
    },
    {
      school_code: 4316,
      school: "Mill Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 4334,
      school: "Heatherwood Middle School",
      is_district_office: false,
    },
    {
      school_code: 4382,
      school: "Cedar Wood Elementary",
      is_district_office: false,
    },
    {
      school_code: 4437,
      school: "Gateway Middle School",
      is_district_office: false,
    },
    {
      school_code: 4438,
      school: "Henry M. Jackson High School",
      is_district_office: false,
    },
    {
      school_code: 4530,
      school: "Penny Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 5091,
      school: "Forest View Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5330,
      school: "Everett Reengagement Academy",
      is_district_office: false,
    },
    {
      school_code: 5414,
      school: "Other Schools",
      is_district_office: false,
    },
    {
      school_code: 5570,
      school: "Tambark Creek Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5670,
      school: "Everett Virtual Academy",
      is_district_office: false,
    },
    {
      school_code: 5735,
      school: "Everett Virtual Academy",
      is_district_office: false,
    },
  ],
  31004: [
    {
      school_code: 1074,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1753,
      school: "Homelink",
      is_district_office: false,
    },
    {
      school_code: 2426,
      school: "Lake Stevens Sr High School",
      is_district_office: false,
    },
    {
      school_code: 2884,
      school: "Mt. Pilchuck Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2885,
      school: "Hillcrest Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3408,
      school: "Lake Stevens Middle School",
      is_district_office: false,
    },
    {
      school_code: 3753,
      school: "Sunnycrest Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4139,
      school: "North Lake Middle School",
      is_district_office: false,
    },
    {
      school_code: 4140,
      school: "Prove High School",
      is_district_office: false,
    },
    {
      school_code: 4391,
      school: "Glenwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 4392,
      school: "Skyline Elementary",
      is_district_office: false,
    },
    {
      school_code: 4534,
      school: "Highland Elementary",
      is_district_office: false,
    },
    {
      school_code: 5099,
      school: "Cavelero Mid High School",
      is_district_office: false,
    },
    {
      school_code: 5441,
      school: "Early Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5442,
      school: "Outcomes for Academic Resilience",
      is_district_office: false,
    },
    {
      school_code: 5477,
      school: "Stevens Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 5742,
      school: "LSSD Open Doors",
      is_district_office: false,
    },
  ],
  31006: [
    {
      school_code: 1056,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1848,
      school: "Special Services",
      is_district_office: false,
    },
    {
      school_code: 1960,
      school: "ECEAP",
      is_district_office: false,
    },
    {
      school_code: 2886,
      school: "Fairmount Elementary",
      is_district_office: false,
    },
    {
      school_code: 3120,
      school: "Olympic View Middle School",
      is_district_office: false,
    },
    {
      school_code: 3121,
      school: "Olivia Park Elementary",
      is_district_office: false,
    },
    {
      school_code: 3687,
      school: "Serene Lake Elementary",
      is_district_office: false,
    },
    {
      school_code: 3688,
      school: "Mariner High School",
      is_district_office: false,
    },
    {
      school_code: 4019,
      school: "Sno-Isle Skills Center",
      is_district_office: false,
    },
    {
      school_code: 4164,
      school: "Mukilteo Elementary",
      is_district_office: false,
    },
    {
      school_code: 4165,
      school: "Picnic Point Elementary",
      is_district_office: false,
    },
    {
      school_code: 4231,
      school: "Explorer Middle School",
      is_district_office: false,
    },
    {
      school_code: 4247,
      school: "ACES High School",
      is_district_office: false,
    },
    {
      school_code: 4303,
      school: "Challenger Elementary",
      is_district_office: false,
    },
    {
      school_code: 4304,
      school: "Discovery Elementary",
      is_district_office: false,
    },
    {
      school_code: 4342,
      school: "Columbia Elementary",
      is_district_office: false,
    },
    {
      school_code: 4344,
      school: "Horizon Elementary",
      is_district_office: false,
    },
    {
      school_code: 4425,
      school: "Voyager Middle School",
      is_district_office: false,
    },
    {
      school_code: 4430,
      school: "Harbour Pointe Middle School",
      is_district_office: false,
    },
    {
      school_code: 4433,
      school: "Kamiak High School",
      is_district_office: false,
    },
    {
      school_code: 4469,
      school: "Endeavour Elementary",
      is_district_office: false,
    },
    {
      school_code: 4583,
      school: "Odyssey Elementary",
      is_district_office: false,
    },
    {
      school_code: 5450,
      school: "Lake Stickney Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5482,
      school: "Pathfinder Kindergarten Center",
      is_district_office: false,
    },
    {
      school_code: 5498,
      school: "Mukilteo Reengagement Academy Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5703,
      school: "Mukilteo Virtual Academy",
      is_district_office: false,
    },
  ],
  31015: [
    {
      school_code: 1001,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1519,
      school: "Edmonds eLearning Academy",
      is_district_office: false,
    },
    {
      school_code: 1520,
      school: "Challenge Elementary",
      is_district_office: false,
    },
    {
      school_code: 1558,
      school: "Unassigned School",
      is_district_office: false,
    },
    {
      school_code: 1685,
      school: "Maplewood Parent Coop",
      is_district_office: false,
    },
    {
      school_code: 1830,
      school: "Contracted Schools",
      is_district_office: false,
    },
    {
      school_code: 1966,
      school: "Edmonds Heights K-12",
      is_district_office: false,
    },
    {
      school_code: 2887,
      school: "Martha Lake Elementary",
      is_district_office: false,
    },
    {
      school_code: 2888,
      school: "Terrace Park Elementary",
      is_district_office: false,
    },
    {
      school_code: 3122,
      school: "Lynndale Elementary",
      is_district_office: false,
    },
    {
      school_code: 3123,
      school: "Edmonds Woodway High School",
      is_district_office: false,
    },
    {
      school_code: 3185,
      school: "Early Childhood Center",
      is_district_office: false,
    },
    {
      school_code: 3186,
      school: "Westgate Elementary",
      is_district_office: false,
    },
    {
      school_code: 3254,
      school: "Mountlake Terrace Elementary",
      is_district_office: false,
    },
    {
      school_code: 3410,
      school: "Spruce Elementary",
      is_district_office: false,
    },
    {
      school_code: 3302,
      school: "Beverly Elementary",
      is_district_office: false,
    },
    {
      school_code: 3303,
      school: "Mountlake Terrace High School",
      is_district_office: false,
    },
    {
      school_code: 3304,
      school: "Cedar Way Elementary",
      is_district_office: false,
    },
    {
      school_code: 3353,
      school: "Meadowdale Middle School",
      is_district_office: false,
    },
    {
      school_code: 3409,
      school: "Cedar Valley Community School",
      is_district_office: false,
    },
    {
      school_code: 3461,
      school: "Seaview Elementary",
      is_district_office: false,
    },
    {
      school_code: 3463,
      school: "Madrona K-8 School",
      is_district_office: false,
    },
    {
      school_code: 3464,
      school: "Meadowdale High School",
      is_district_office: false,
    },
    {
      school_code: 3503,
      school: "Lynnwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 3504,
      school: "Meadowdale Elementary",
      is_district_office: false,
    },
    {
      school_code: 3534,
      school: "Chase Lake Elementary",
      is_district_office: false,
    },
    {
      school_code: 3536,
      school: "Brier Elementary",
      is_district_office: false,
    },
    {
      school_code: 3560,
      school: "Alderwood Middle School",
      is_district_office: false,
    },
    {
      school_code: 3605,
      school: "Sherwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 3606,
      school: "Edmonds Elementary",
      is_district_office: false,
    },
    {
      school_code: 3607,
      school: "Hazelwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 3608,
      school: "Oak Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 3650,
      school: "Brier Terrace Middle School",
      is_district_office: false,
    },
    {
      school_code: 3689,
      school: "Hilltop Elementary",
      is_district_office: false,
    },
    {
      school_code: 3691,
      school: "College Place Elementary",
      is_district_office: false,
    },
    {
      school_code: 3754,
      school: "College Place Middle School",
      is_district_office: false,
    },
    {
      school_code: 3755,
      school: "Lynnwood High School",
      is_district_office: false,
    },
    {
      school_code: 3818,
      school: "Maplewood Center",
      is_district_office: false,
    },
    {
      school_code: 3854,
      school: "Scriber Lake High School",
      is_district_office: false,
    },
    {
      school_code: 5358,
      school: "Edmonds Career Access Program",
      is_district_office: false,
    },
    {
      school_code: 5669,
      school: "Woodway Center",
      is_district_office: false,
    },
  ],
  31016: [
    {
      school_code: 1075,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1714,
      school: "Stillaguamish Valley Learning Center",
      is_district_office: false,
    },
    {
      school_code: 2277,
      school: "Arlington Special Educ School",
      is_district_office: false,
    },
    {
      school_code: 2523,
      school: "Arlington High School",
      is_district_office: false,
    },
    {
      school_code: 3124,
      school: "Post Middle School",
      is_district_office: false,
    },
    {
      school_code: 4154,
      school: "Presidents Elementary",
      is_district_office: false,
    },
    {
      school_code: 4287,
      school: "Weston High School",
      is_district_office: false,
    },
    {
      school_code: 4327,
      school: "Eagle Creek Elementary",
      is_district_office: false,
    },
    {
      school_code: 4436,
      school: "Kent Prairie Elementary",
      is_district_office: false,
    },
    {
      school_code: 4573,
      school: "Pioneer Elementary",
      is_district_office: false,
    },
    {
      school_code: 5010,
      school: "Haller Middle School",
      is_district_office: false,
    },
    {
      school_code: 5495,
      school: "Arlington Open Doors",
      is_district_office: false,
    },
  ],
  31025: [
    {
      school_code: 1023,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1656,
      school: "10th Street School",
      is_district_office: false,
    },
    {
      school_code: 1657,
      school: "Heritage School",
      is_district_office: false,
    },
    {
      school_code: 1744,
      school: "School Home Partnership Program",
      is_district_office: false,
    },
    {
      school_code: 1862,
      school: "Marysville Coop Program",
      is_district_office: false,
    },
    {
      school_code: 1895,
      school: "ECEAP",
      is_district_office: false,
    },
    {
      school_code: 1910,
      school: "Marysville SD Special",
      is_district_office: false,
    },
    {
      school_code: 1927,
      school: "Legacy High School",
      is_district_office: false,
    },
    {
      school_code: 2813,
      school: "Totem Middle School",
      is_district_office: false,
    },
    {
      school_code: 3059,
      school: "Cascade Elementary",
      is_district_office: false,
    },
    {
      school_code: 3187,
      school: "Shoultes Elementary",
      is_district_office: false,
    },
    {
      school_code: 3355,
      school: "Marysville Middle School",
      is_district_office: false,
    },
    {
      school_code: 3537,
      school: "Sunnyside Elementary",
      is_district_office: false,
    },
    {
      school_code: 3651,
      school: "Pinewood Elementary",
      is_district_office: false,
    },
    {
      school_code: 3964,
      school: "Liberty Elementary",
      is_district_office: false,
    },
    {
      school_code: 4150,
      school: "Marshall Elementary",
      is_district_office: false,
    },
    {
      school_code: 4233,
      school: "Marysville Mountain View High School",
      is_district_office: false,
    },
    {
      school_code: 4323,
      school: "Kellogg Marsh Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4357,
      school: "Cedarcrest School",
      is_district_office: false,
    },
    {
      school_code: 4454,
      school: "Allen Creek Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5123,
      school: "Grove Elementary",
      is_district_office: false,
    },
    {
      school_code: 5209,
      school: "Academy of Const and Engineering",
      is_district_office: false,
    },
    {
      school_code: 5210,
      school: "Bio Med Academy",
      is_district_office: false,
    },
    {
      school_code: 5211,
      school: "Intl Sch of Communications",
      is_district_office: false,
    },
    {
      school_code: 5213,
      school: "Marysville Pilchuck High School",
      is_district_office: false,
    },
    {
      school_code: 5214,
      school: "School for the Entrepreneur",
      is_district_office: false,
    },
    {
      school_code: 5350,
      school: "Quil Ceda Tulalip Elementary",
      is_district_office: false,
    },
    {
      school_code: 5402,
      school: "Marysville NWESD 189 Youth Engagement",
      is_district_office: false,
    },
    {
      school_code: 5478,
      school: "Marysville Getchell High School",
      is_district_office: false,
    },
    {
      school_code: 5731,
      school: "Marysville Online High School",
      is_district_office: false,
    },
  ],
  31063: [
    {
      school_code: 1295,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2948,
      school: "Index Elementary School",
      is_district_office: false,
    },
  ],
  31103: [
    {
      school_code: 1076,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1570,
      school: "Monroe Special Ed Preschool",
      is_district_office: false,
    },
    {
      school_code: 1643,
      school: "Out Of District Special Ed",
      is_district_office: false,
    },
    {
      school_code: 1777,
      school: "Sky Valley Education Center",
      is_district_office: false,
    },
    {
      school_code: 1806,
      school: "Leaders In Learning",
      is_district_office: false,
    },
    {
      school_code: 2546,
      school: "Maltby Elementary",
      is_district_office: false,
    },
    {
      school_code: 3060,
      school: "Frank Wagner Elementary",
      is_district_office: false,
    },
    {
      school_code: 4159,
      school: "Salem Woods Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4362,
      school: "Chain Lake Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4528,
      school: "Monroe High School",
      is_district_office: false,
    },
    {
      school_code: 4544,
      school: "Hidden River Middle School",
      is_district_office: false,
    },
    {
      school_code: 4594,
      school: "Fryelands Elementary",
      is_district_office: false,
    },
    {
      school_code: 5040,
      school: "Park Place Middle School",
      is_district_office: false,
    },
  ],
  31201: [
    {
      school_code: 1057,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1730,
      school: "Snohomish Center",
      is_district_office: false,
    },
    {
      school_code: 1757,
      school: "Snohomish Online Learning",
      is_district_office: false,
    },
    {
      school_code: 1904,
      school: "Parent Partnership",
      is_district_office: false,
    },
    {
      school_code: 2073,
      school: "Machias Elementary",
      is_district_office: false,
    },
    {
      school_code: 2428,
      school: "Snohomish High School",
      is_district_office: false,
    },
    {
      school_code: 3005,
      school: "Emerson Elementary",
      is_district_office: false,
    },
    {
      school_code: 3305,
      school: "Cathcart Elementary",
      is_district_office: false,
    },
    {
      school_code: 3561,
      school: "Riverview Elementary",
      is_district_office: false,
    },
    {
      school_code: 3981,
      school: "High School Re Entry",
      is_district_office: false,
    },
    {
      school_code: 4145,
      school: "Valley View Middle School",
      is_district_office: false,
    },
    {
      school_code: 4184,
      school: "Seattle Hill Elementary",
      is_district_office: false,
    },
    {
      school_code: 4241,
      school: "Dutch Hill Elementary",
      is_district_office: false,
    },
    {
      school_code: 4265,
      school: "AIM High School",
      is_district_office: false,
    },
    {
      school_code: 4366,
      school: "Cascade View Elementary",
      is_district_office: false,
    },
    {
      school_code: 4383,
      school: "Totem Falls",
      is_district_office: false,
    },
    {
      school_code: 4395,
      school: "Centennial Middle School",
      is_district_office: false,
    },
    {
      school_code: 5100,
      school: "Little Cedars Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5128,
      school: "Glacier Peak High School",
      is_district_office: false,
    },
    {
      school_code: 5712,
      school: "Central Primary Center",
      is_district_office: false,
    },
  ],
  31306: [
    {
      school_code: 1258,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3255,
      school: "Lakewood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3893,
      school: "Lakewood Middle School",
      is_district_office: false,
    },
    {
      school_code: 4204,
      school: "Lakewood High School",
      is_district_office: false,
    },
    {
      school_code: 4477,
      school: "English Crossing Elementary",
      is_district_office: false,
    },
    {
      school_code: 4576,
      school: "Cougar Creek Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5404,
      school: "Lakewood NWESD 189 Open Door Program",
      is_district_office: false,
    },
  ],
  31311: [
    {
      school_code: 1102,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1670,
      school: "Student Services School",
      is_district_office: false,
    },
    {
      school_code: 2105,
      school: "Sultan Middle School",
      is_district_office: false,
    },
    {
      school_code: 2229,
      school: "Sultan Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4274,
      school: "Sultan Senior High School",
      is_district_office: false,
    },
    {
      school_code: 4399,
      school: "Gold Bar Elementary",
      is_district_office: false,
    },
    {
      school_code: 5114,
      school: "Sky Valley Options",
      is_district_office: false,
    },
    {
      school_code: 5152,
      school: "Columbia Virtual Academy - Sultan",
      is_district_office: false,
    },
    {
      school_code: 5329,
      school: "Open Doors Youth Reengagement Sultan",
      is_district_office: false,
    },
    {
      school_code: 5642,
      school: "Sultan Virtual Academy",
      is_district_office: false,
    },
  ],
  31330: [
    {
      school_code: 1163,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3188,
      school: "Darrington High School",
      is_district_office: false,
    },
    {
      school_code: 3609,
      school: "Darrington Elementary School",
      is_district_office: false,
    },
  ],
  31332: [
    {
      school_code: 1164,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2580,
      school: "Granite Falls High School",
      is_district_office: false,
    },
    {
      school_code: 4113,
      school: "Granite Falls Middle School",
      is_district_office: false,
    },
    {
      school_code: 4330,
      school: "Mountain Way Elementary",
      is_district_office: false,
    },
    {
      school_code: 4479,
      school: "Monte Cristo Elementary",
      is_district_office: false,
    },
    {
      school_code: 5171,
      school: "Crossroads High School",
      is_district_office: false,
    },
    {
      school_code: 5349,
      school: "Granite Falls Open Doors",
      is_district_office: false,
    },
  ],
  31401: [
    {
      school_code: 1103,
      school: "District Office -  Stanwood",
      is_district_office: true,
    },
    {
      school_code: 1707,
      school: "Lincoln Hill High School",
      is_district_office: false,
    },
    {
      school_code: 2400,
      school: "Stanwood Middle School",
      is_district_office: false,
    },
    {
      school_code: 2581,
      school: "Stanwood High School",
      is_district_office: false,
    },
    {
      school_code: 3125,
      school: "Stanwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4364,
      school: "Twin City Elementary",
      is_district_office: false,
    },
    {
      school_code: 4512,
      school: "Port Susan Middle School",
      is_district_office: false,
    },
    {
      school_code: 4513,
      school: "Cedarhome Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4551,
      school: "Utsalady Elementary",
      is_district_office: false,
    },
    {
      school_code: 4553,
      school: "Elger Bay Elementary",
      is_district_office: false,
    },
    {
      school_code: 5004,
      school: "Saratoga School",
      is_district_office: false,
    },
    {
      school_code: 5108,
      school: "Lincoln Academy",
      is_district_office: false,
    },
  ],
  32081: [
    {
      school_code: 1000,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1533,
      school: "A-3 Multiagency Adolescent Prog",
      is_district_office: false,
    },
    {
      school_code: 1566,
      school: "Alternative Northeast Community Center Preschool",
      is_district_office: false,
    },
    {
      school_code: 1567,
      school: "Pratt Academy",
      is_district_office: false,
    },
    {
      school_code: 1603,
      school: "Daybreak Alternative School",
      is_district_office: false,
    },
    {
      school_code: 1604,
      school: "Alternative Tamarack School",
      is_district_office: false,
    },
    {
      school_code: 1698,
      school: "SCCP Images",
      is_district_office: false,
    },
    {
      school_code: 1767,
      school: "The Healing Lodge",
      is_district_office: false,
    },
    {
      school_code: 2045,
      school: "Shrine Hospital",
      is_district_office: false,
    },
    {
      school_code: 2056,
      school: "Holmes Elementary",
      is_district_office: false,
    },
    {
      school_code: 2086,
      school: "Roosevelt Elementary",
      is_district_office: false,
    },
    {
      school_code: 2096,
      school: "Regal Elementary",
      is_district_office: false,
    },
    {
      school_code: 2106,
      school: "North Central High School",
      is_district_office: false,
    },
    {
      school_code: 2108,
      school: "Stevens Elementary",
      is_district_office: false,
    },
    {
      school_code: 2109,
      school: "Willard Elementary",
      is_district_office: false,
    },
    {
      school_code: 2110,
      school: "Sheridan Elementary",
      is_district_office: false,
    },
    {
      school_code: 2111,
      school: "Jefferson Elementary",
      is_district_office: false,
    },
    {
      school_code: 2127,
      school: "Franklin Elementary",
      is_district_office: false,
    },
    {
      school_code: 2128,
      school: "Audubon Elementary",
      is_district_office: false,
    },
    {
      school_code: 2129,
      school: "Cooper Elementary",
      is_district_office: false,
    },
    {
      school_code: 2155,
      school: "Bemiss Elementary",
      is_district_office: false,
    },
    {
      school_code: 2156,
      school: "Adams Elementary",
      is_district_office: false,
    },
    {
      school_code: 2172,
      school: "Lewis & Clark High School",
      is_district_office: false,
    },
    {
      school_code: 2191,
      school: "Whitman Elementary",
      is_district_office: false,
    },
    {
      school_code: 2218,
      school: "Browne Elementary",
      is_district_office: false,
    },
    {
      school_code: 2258,
      school: "Hutton Elementary",
      is_district_office: false,
    },
    {
      school_code: 2296,
      school: "Wilson Elementary",
      is_district_office: false,
    },
    {
      school_code: 2312,
      school: "Finch Elementary",
      is_district_office: false,
    },
    {
      school_code: 2381,
      school: "Arlington Elementary",
      is_district_office: false,
    },
    {
      school_code: 2401,
      school: "Libby Center",
      is_district_office: false,
    },
    {
      school_code: 2479,
      school: "Rogers High School",
      is_district_office: false,
    },
    {
      school_code: 2708,
      school: "Madison Elementary",
      is_district_office: false,
    },
    {
      school_code: 2950,
      school: "Ridgeview Elementary",
      is_district_office: false,
    },
    {
      school_code: 2951,
      school: "Lincoln Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 2952,
      school: "Lidgerwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 3007,
      school: "Hamblen Elementary",
      is_district_office: false,
    },
    {
      school_code: 3008,
      school: "Bryant Center",
      is_district_office: false,
    },
    {
      school_code: 3063,
      school: "Westview Elementary",
      is_district_office: false,
    },
    {
      school_code: 3189,
      school: "Shadle Park High School",
      is_district_office: false,
    },
    {
      school_code: 3190,
      school: "Linwood Elementary",
      is_district_office: false,
    },
    {
      school_code: 3257,
      school: "Shaw Middle School",
      is_district_office: false,
    },
    {
      school_code: 3258,
      school: "Glover Middle School",
      is_district_office: false,
    },
    {
      school_code: 3356,
      school: "Sacajawea Middle School",
      is_district_office: false,
    },
    {
      school_code: 3357,
      school: "Balboa Elementary",
      is_district_office: false,
    },
    {
      school_code: 3412,
      school: "Ferris High School",
      is_district_office: false,
    },
    {
      school_code: 3413,
      school: "Salk Middle School",
      is_district_office: false,
    },
    {
      school_code: 3506,
      school: "Indian Trail Elementary",
      is_district_office: false,
    },
    {
      school_code: 3718,
      school: "Longfellow Elementary",
      is_district_office: false,
    },
    {
      school_code: 3719,
      school: "Logan Elementary",
      is_district_office: false,
    },
    {
      school_code: 3727,
      school: "Garfield Elementary",
      is_district_office: false,
    },
    {
      school_code: 3729,
      school: "Grant Elementary",
      is_district_office: false,
    },
    {
      school_code: 3758,
      school: "Garry Middle School",
      is_district_office: false,
    },
    {
      school_code: 3819,
      school: "Excelsior Youth Center School",
      is_district_office: false,
    },
    {
      school_code: 4035,
      school: "Mullan Road Elementary",
      is_district_office: false,
    },
    {
      school_code: 4191,
      school: "Spokane Area Professional-Technical Skills Center",
      is_district_office: false,
    },
    {
      school_code: 4192,
      school: "Woodridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 4286,
      school: "Sacred Heart Hospital",
      is_district_office: false,
    },
    {
      school_code: 4389,
      school: "Moran Prairie Elementary",
      is_district_office: false,
    },
    {
      school_code: 4457,
      school: "Chase Middle School",
      is_district_office: false,
    },
    {
      school_code: 5113,
      school: "Spokane Regional Health District",
      is_district_office: false,
    },
    {
      school_code: 5249,
      school: "Spokane County Jail",
      is_district_office: false,
    },
    {
      school_code: 5250,
      school: "On Track Academy",
      is_district_office: false,
    },
    {
      school_code: 5301,
      school: "The Community School",
      is_district_office: false,
    },
    {
      school_code: 5344,
      school: "Open Doors Youth Re-Engagement Spokane",
      is_district_office: false,
    },
    {
      school_code: 5361,
      school: "Spokane Public Montessori",
      is_district_office: false,
    },
    {
      school_code: 5630,
      school: "West Central Community Center",
      is_district_office: false,
    },
    {
      school_code: 5693,
      school: "Flett Middle School",
      is_district_office: false,
    },
    {
      school_code: 5694,
      school: "Spokane Virtual Academy",
      is_district_office: false,
    },
    {
      school_code: 5695,
      school: "Yasuhara Middle School",
      is_district_office: false,
    },
    {
      school_code: 5730,
      school: "Peperzak Middle School",
      is_district_office: false,
    },
    {
      school_code: 5743,
      school: "Spokane Public Language Immersion",
      is_district_office: false,
    },
  ],
  32123: [
    {
      school_code: 1296,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3723,
      school: "Orchard Prairie Elementary",
      is_district_office: false,
    },
  ],
  32312: [
    {
      school_code: 1297,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2097,
      school: "Great Northern Elementary",
      is_district_office: false,
    },
  ],
  32325: [
    {
      school_code: 1260,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2341,
      school: "Nine Mile Falls Elementary",
      is_district_office: false,
    },
    {
      school_code: 4036,
      school: "Lake Spokane Elementary",
      is_district_office: false,
    },
    {
      school_code: 4333,
      school: "Lakeside High School",
      is_district_office: false,
    },
    {
      school_code: 4521,
      school: "Lakeside Middle School",
      is_district_office: false,
    },
    {
      school_code: 5417,
      school: "Re-Engagement School (Nine Mile Falls)",
      is_district_office: false,
    },
    {
      school_code: 5752,
      school: "Nine Mile Family Partnership Program",
      is_district_office: false,
    },
  ],
  32326: [
    {
      school_code: 1069,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2890,
      school: "Medical Lake High School",
      is_district_office: false,
    },
    {
      school_code: 3965,
      school: "Medical Lake Middle School",
      is_district_office: false,
    },
    {
      school_code: 4483,
      school: "Hallett Elementary",
      is_district_office: false,
    },
    {
      school_code: 4577,
      school: "Michael Anderson Elementary",
      is_district_office: false,
    },
  ],
  32354: [
    {
      school_code: 1039,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1803,
      school: "Mead Alternative High School",
      is_district_office: false,
    },
    {
      school_code: 1858,
      school: "Mead Education Partnership Prog",
      is_district_office: false,
    },
    {
      school_code: 2402,
      school: "Mead Senior High School",
      is_district_office: false,
    },
    {
      school_code: 3191,
      school: "Mountainside Middle School",
      is_district_office: false,
    },
    {
      school_code: 3414,
      school: "Evergreen Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3562,
      school: "Colbert Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3693,
      school: "Brentwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3759,
      school: "Farwell Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3851,
      school: "Northwood Middle School",
      is_district_office: false,
    },
    {
      school_code: 4133,
      school: "Midway Elementary",
      is_district_office: false,
    },
    {
      school_code: 4134,
      school: "Shiloh Hills Elementary",
      is_district_office: false,
    },
    {
      school_code: 4400,
      school: "Meadow Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 4491,
      school: "Mt Spokane High School",
      is_district_office: false,
    },
    {
      school_code: 5094,
      school: "Prairie View Elementary",
      is_district_office: false,
    },
    {
      school_code: 5122,
      school: "Mead PreSchool",
      is_district_office: false,
    },
    {
      school_code: 5268,
      school: "Riverpoint Academy",
      is_district_office: false,
    },
    {
      school_code: 5401,
      school: "Mead Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5571,
      school: "Highland Middle School",
      is_district_office: false,
    },
    {
      school_code: 5572,
      school: "Creekside Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5658,
      school: "Skyline Elementary",
      is_district_office: false,
    },
  ],
  32356: [
    {
      school_code: 1015,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1964,
      school: "Spokane Valley Learning Academy",
      is_district_office: false,
    },
    {
      school_code: 2113,
      school: "Opportunity Elementary",
      is_district_office: false,
    },
    {
      school_code: 2157,
      school: "Greenacres Elementary",
      is_district_office: false,
    },
    {
      school_code: 2776,
      school: "North Pines Middle School",
      is_district_office: false,
    },
    {
      school_code: 2892,
      school: "Broadway Elementary",
      is_district_office: false,
    },
    {
      school_code: 2953,
      school: "Progress Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3064,
      school: "University Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3065,
      school: "Central Valley High School",
      is_district_office: false,
    },
    {
      school_code: 3127,
      school: "McDonald Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3259,
      school: "Adams Elementary",
      is_district_office: false,
    },
    {
      school_code: 3260,
      school: "Bowdish Middle School",
      is_district_office: false,
    },
    {
      school_code: 3307,
      school: "South Pines Elementary",
      is_district_office: false,
    },
    {
      school_code: 3415,
      school: "University High School",
      is_district_office: false,
    },
    {
      school_code: 3465,
      school: "Summit School",
      is_district_office: false,
    },
    {
      school_code: 3573,
      school: "Greenacres Middle School",
      is_district_office: false,
    },
    {
      school_code: 3890,
      school: "Evergreen Middle School",
      is_district_office: false,
    },
    {
      school_code: 3918,
      school: "Mica Peak High School",
      is_district_office: false,
    },
    {
      school_code: 3929,
      school: "Chester Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4098,
      school: "Ponderosa Elementary",
      is_district_office: false,
    },
    {
      school_code: 4160,
      school: "Sunrise Elementary",
      is_district_office: false,
    },
    {
      school_code: 4185,
      school: "Horizon Middle School",
      is_district_office: false,
    },
    {
      school_code: 4529,
      school: "Liberty Lake Elementary",
      is_district_office: false,
    },
    {
      school_code: 5003,
      school: "School to Life",
      is_district_office: false,
    },
    {
      school_code: 5043,
      school: "Central Valley Early Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5068,
      school: "Central Valley Kindergarten Center",
      is_district_office: false,
    },
    {
      school_code: 5278,
      school: "Spokane Valley Tech",
      is_district_office: false,
    },
    {
      school_code: 5328,
      school: "CVSD Open Doors Programs",
      is_district_office: false,
    },
    {
      school_code: 5507,
      school: "Liberty Creek Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5541,
      school: "Riverbend Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5542,
      school: "STEM Academy at SVT",
      is_district_office: false,
    },
    {
      school_code: 5552,
      school: "Selkirk Middle School",
      is_district_office: false,
    },
    {
      school_code: 5660,
      school: "Ridgeline High School",
      is_district_office: false,
    },
    {
      school_code: 5667,
      school: "Central Valley Virtual Learning",
      is_district_office: false,
    },
  ],
  32358: [
    {
      school_code: 1150,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3192,
      school: "Freeman High School",
      is_district_office: false,
    },
    {
      school_code: 3794,
      school: "Freeman Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4593,
      school: "Freeman Middle School",
      is_district_office: false,
    },
  ],
  32360: [
    {
      school_code: 1040,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1769,
      school: "Three Springs High School",
      is_district_office: false,
    },
    {
      school_code: 2447,
      school: "Cheney Middle School",
      is_district_office: false,
    },
    {
      school_code: 2814,
      school: "Sunset Elementary",
      is_district_office: false,
    },
    {
      school_code: 2954,
      school: "Betz Elementary",
      is_district_office: false,
    },
    {
      school_code: 3309,
      school: "Windsor Elementary",
      is_district_office: false,
    },
    {
      school_code: 3610,
      school: "Cheney High School",
      is_district_office: false,
    },
    {
      school_code: 3761,
      school: "Salnave Elementary",
      is_district_office: false,
    },
    {
      school_code: 5035,
      school: "HomeWorks",
      is_district_office: false,
    },
    {
      school_code: 5126,
      school: "Birth To Three",
      is_district_office: false,
    },
    {
      school_code: 5269,
      school: "Westwood Middle School",
      is_district_office: false,
    },
    {
      school_code: 5294,
      school: "Phil Snowdon Elementary",
      is_district_office: false,
    },
    {
      school_code: 5396,
      school: "Cheney Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5750,
      school: "WIN Academy",
      is_district_office: false,
    },
  ],
  32361: [
    {
      school_code: 1070,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1712,
      school: "Continuous Curriculum School",
      is_district_office: false,
    },
    {
      school_code: 1937,
      school: "Children First",
      is_district_office: false,
    },
    {
      school_code: 2653,
      school: "Trent School",
      is_district_office: false,
    },
    {
      school_code: 2955,
      school: "Otis Orchards School",
      is_district_office: false,
    },
    {
      school_code: 3128,
      school: "Trentwood School",
      is_district_office: false,
    },
    {
      school_code: 3360,
      school: "East Valley High School",
      is_district_office: false,
    },
    {
      school_code: 4097,
      school: "East Farms STEAM School",
      is_district_office: false,
    },
    {
      school_code: 5346,
      school: "East Valley Middle School",
      is_district_office: false,
    },
    {
      school_code: 5432,
      school: "EV Online",
      is_district_office: false,
    },
    {
      school_code: 5433,
      school: "EV Parent Partnership",
      is_district_office: false,
    },
  ],
  32362: [
    {
      school_code: 1151,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3416,
      school: "Liberty High School",
      is_district_office: false,
    },
    {
      school_code: 4226,
      school: "Liberty Jr High & Elementary",
      is_district_office: false,
    },
  ],
  32363: [
    {
      school_code: 1041,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1628,
      school: "Dishman Hills High School",
      is_district_office: false,
    },
    {
      school_code: 1755,
      school: "West Valley City School",
      is_district_office: false,
    },
    {
      school_code: 1838,
      school: "Spokane Valley High School",
      is_district_office: false,
    },
    {
      school_code: 1842,
      school: "Spokane Valley Transition School",
      is_district_office: false,
    },
    {
      school_code: 2711,
      school: "Millwood Kindergarten Center",
      is_district_office: false,
    },
    {
      school_code: 2956,
      school: "Seth Woodard Elementary",
      is_district_office: false,
    },
    {
      school_code: 3129,
      school: "Orchard Center Elementary",
      is_district_office: false,
    },
    {
      school_code: 3194,
      school: "Pasadena Park Elementary",
      is_district_office: false,
    },
    {
      school_code: 3195,
      school: "West Valley High School",
      is_district_office: false,
    },
    {
      school_code: 3196,
      school: "Ness Elementary",
      is_district_office: false,
    },
    {
      school_code: 3538,
      school: "Centennial Middle School",
      is_district_office: false,
    },
    {
      school_code: 5356,
      school: "re-engagement",
      is_district_office: false,
    },
    {
      school_code: 5462,
      school: "West Valley Early Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5645,
      school: "Spokane Valley High School",
      is_district_office: false,
    },
    {
      school_code: 5698,
      school: "West Valley Virtual Learning Center",
      is_district_office: false,
    },
  ],
  32414: [
    {
      school_code: 1085,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1852,
      school: "Deer Park Home Link Program",
      is_district_office: false,
    },
    {
      school_code: 2173,
      school: "Arcadia Elementary",
      is_district_office: false,
    },
    {
      school_code: 2430,
      school: "Deer Park Elementary",
      is_district_office: false,
    },
    {
      school_code: 3261,
      school: "Deer Park Middle School",
      is_district_office: false,
    },
    {
      school_code: 4123,
      school: "Deer Park High School",
      is_district_office: false,
    },
    {
      school_code: 5124,
      school: "BIRTH TO 2 PRESCHOOL",
      is_district_office: false,
    },
    {
      school_code: 5270,
      school: "Deer Park Early Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5734,
      school: "Deer Park Achievement High School",
      is_district_office: false,
    },
  ],
  32416: [
    {
      school_code: 1121,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1554,
      school: "Riverside Achievement Center",
      is_district_office: false,
    },
    {
      school_code: 1919,
      school: "Independent Scholar",
      is_district_office: false,
    },
    {
      school_code: 2525,
      school: "Chattaroy Elementary",
      is_district_office: false,
    },
    {
      school_code: 3466,
      school: "Riverside Middle School",
      is_district_office: false,
    },
    {
      school_code: 4033,
      school: "Riverside Elementary",
      is_district_office: false,
    },
    {
      school_code: 4228,
      school: "Riverside High School",
      is_district_office: false,
    },
  ],
  32801: [
    {
      school_code: 3352,
      school: "Martin Hall Detention Ctr",
      is_district_office: false,
    },
    {
      school_code: 3507,
      school: "Structural Alt Confinement School",
      is_district_office: false,
    },
    {
      school_code: 3526,
      school: "Spokane Juvenile Detention School",
      is_district_office: false,
    },
    {
      school_code: 5434,
      school: "NEWESD 101 Open Doors",
      is_district_office: false,
    },
  ],
  32901: [
    {
      school_code: 1344,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5381,
      school: "Spokane International Academy",
      is_district_office: false,
    },
  ],
  32903: [
    {
      school_code: 1360,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5609,
      school: "Lumen High School",
      is_district_office: false,
    },
  ],
  32907: [
    {
      school_code: 1336,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5339,
      school: "PRIDE Prep School",
      is_district_office: false,
    },
  ],
  33030: [
    {
      school_code: 1298,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2049,
      school: "Onion Creek Elementary",
      is_district_office: false,
    },
  ],
  33036: [
    {
      school_code: 1122,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1709,
      school: "Chewelah Alternative",
      is_district_office: false,
    },
    {
      school_code: 1763,
      school: "Quartzite Learning",
      is_district_office: false,
    },
    {
      school_code: 2404,
      school: "Jenkins Junior/Senior High",
      is_district_office: false,
    },
    {
      school_code: 2664,
      school: "Gess Elementary",
      is_district_office: false,
    },
    {
      school_code: 5523,
      school: "Chewelah Open Doors Reengagement Program",
      is_district_office: false,
    },
  ],
  33049: [
    {
      school_code: 1231,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1851,
      school: "Wellpinit Alliance High School",
      is_district_office: false,
    },
    {
      school_code: 1911,
      school: "Wellpinit - Fort Semco High School",
      is_district_office: false,
    },
    {
      school_code: 2549,
      school: "Wellpinit Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2550,
      school: "Wellpinit High School",
      is_district_office: false,
    },
    {
      school_code: 4232,
      school: "Wellpinit Middle School",
      is_district_office: false,
    },
    {
      school_code: 5217,
      school: "WSD Columbia Basin J.C.",
      is_district_office: false,
    },
    {
      school_code: 5461,
      school: "Wellpinit Fort Simcoe SEA",
      is_district_office: false,
    },
  ],
  33070: [
    {
      school_code: 1299,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1932,
      school: "Columbia Virtual Academy",
      is_district_office: false,
    },
    {
      school_code: 2405,
      school: "Valley School",
      is_district_office: false,
    },
    {
      school_code: 5223,
      school: "Paideia High School",
      is_district_office: false,
    },
    {
      school_code: 5357,
      school: "Valley Early Learning Center",
      is_district_office: false,
    },
  ],
  33115: [
    {
      school_code: 1086,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1594,
      school: "Panorama School",
      is_district_office: false,
    },
    {
      school_code: 2957,
      school: "Hofstetter Elementary",
      is_district_office: false,
    },
    {
      school_code: 3310,
      school: "Colville Senior High School",
      is_district_office: false,
    },
    {
      school_code: 3831,
      school: "Colville Junior High School",
      is_district_office: false,
    },
    {
      school_code: 4180,
      school: "Fort Colville Elementary",
      is_district_office: false,
    },
    {
      school_code: 5604,
      school: "Colville Fish Hatchery",
      is_district_office: false,
    },
  ],
  33183: [
    {
      school_code: 1300,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1922,
      school: "Loon Lake Homelink Program",
      is_district_office: false,
    },
    {
      school_code: 2480,
      school: "Loon Lake Elementary School",
      is_district_office: false,
    },
  ],
  33202: [
    {
      school_code: 1301,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 4394,
      school: "Summit Valley School",
      is_district_office: false,
    },
  ],
  33205: [
    {
      school_code: 1302,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3197,
      school: "Evergreen School",
      is_district_office: false,
    },
  ],
  33206: [
    {
      school_code: 1206,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3508,
      school: "Columbia High And Elementary",
      is_district_office: false,
    },
    {
      school_code: 5283,
      school: "Columbia Alternative School",
      is_district_office: false,
    },
  ],
  33207: [
    {
      school_code: 1183,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1819,
      school: "Parent Partner Program",
      is_district_office: false,
    },
    {
      school_code: 1820,
      school: "Mary Walker Alternative High Schl",
      is_district_office: false,
    },
    {
      school_code: 1857,
      school: "Springdale Academy",
      is_district_office: false,
    },
    {
      school_code: 2297,
      school: "Springdale Elementary",
      is_district_office: false,
    },
    {
      school_code: 3311,
      school: "Mary Walker High School",
      is_district_office: false,
    },
    {
      school_code: 3894,
      school: "Springdale Middle School",
      is_district_office: false,
    },
    {
      school_code: 5446,
      school: "Mary Walker Alternative Learning Experience",
      is_district_office: false,
    },
  ],
  33211: [
    {
      school_code: 1207,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2062,
      school: "Northport Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2958,
      school: "Northport High School",
      is_district_office: false,
    },
    {
      school_code: 5252,
      school: "Northport Homelink Program",
      is_district_office: false,
    },
  ],
  33212: [
    {
      school_code: 1152,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2385,
      school: "Kettle Falls Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3198,
      school: "Kettle Falls Middle School",
      is_district_office: false,
    },
    {
      school_code: 4206,
      school: "Kettle Falls High School",
      is_district_office: false,
    },
    {
      school_code: 5180,
      school: "Columbia Virtual Academy - Kettle Falls",
      is_district_office: false,
    },
    {
      school_code: 5516,
      school: "Kettle Falls Early Learning Center",
      is_district_office: false,
    },
  ],
  34002: [
    {
      school_code: 1116,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1627,
      school: "Yelm Extension School",
      is_district_office: false,
    },
    {
      school_code: 2260,
      school: "McKenna Elementary",
      is_district_office: false,
    },
    {
      school_code: 2481,
      school: "Yelm Middle School",
      is_district_office: false,
    },
    {
      school_code: 2633,
      school: "Yelm High School 12",
      is_district_office: false,
    },
    {
      school_code: 3848,
      school: "Southworth Elementary",
      is_district_office: false,
    },
    {
      school_code: 4224,
      school: "Yelm Prairie Elementary",
      is_district_office: false,
    },
    {
      school_code: 4346,
      school: "Fort Stevens Elementary",
      is_district_office: false,
    },
    {
      school_code: 4451,
      school: "Mill Pond Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5018,
      school: "Lackamas Elementary",
      is_district_office: false,
    },
    {
      school_code: 5052,
      school: "Ridgeline Middle School",
      is_district_office: false,
    },
  ],
  34003: [
    {
      school_code: 1034,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2754,
      school: "South Bay Elementary",
      is_district_office: false,
    },
    {
      school_code: 3010,
      school: "North Thurston High School",
      is_district_office: false,
    },
    {
      school_code: 3130,
      school: "Mountain View Elementary",
      is_district_office: false,
    },
    {
      school_code: 3262,
      school: "Lydia Hawk Elementary",
      is_district_office: false,
    },
    {
      school_code: 3361,
      school: "Chinook Middle School",
      is_district_office: false,
    },
    {
      school_code: 3539,
      school: "Lakes Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3611,
      school: "Nisqually Middle School",
      is_district_office: false,
    },
    {
      school_code: 3653,
      school: "Lacey Elementary",
      is_district_office: false,
    },
    {
      school_code: 3709,
      school: "Olympic View Elementary",
      is_district_office: false,
    },
    {
      school_code: 3710,
      school: "Timberline High School",
      is_district_office: false,
    },
    {
      school_code: 4058,
      school: "Evergreen Forest Elementary",
      is_district_office: false,
    },
    {
      school_code: 4122,
      school: "Woodland Elementary",
      is_district_office: false,
    },
    {
      school_code: 4255,
      school: "Meadows Elementary",
      is_district_office: false,
    },
    {
      school_code: 4271,
      school: "Pleasant Glade Elementary",
      is_district_office: false,
    },
    {
      school_code: 4314,
      school: "South Sound High School",
      is_district_office: false,
    },
    {
      school_code: 4368,
      school: "Seven Oaks Elementary",
      is_district_office: false,
    },
    {
      school_code: 4408,
      school: "Horizons Elementary",
      is_district_office: false,
    },
    {
      school_code: 4409,
      school: "Komachin Middle School",
      is_district_office: false,
    },
    {
      school_code: 4427,
      school: "River Ridge High School",
      is_district_office: false,
    },
    {
      school_code: 5167,
      school: "Chambers Prairie Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5168,
      school: "Aspire Middle School",
      is_district_office: false,
    },
    {
      school_code: 5452,
      school: "Salish Middle School",
      is_district_office: false,
    },
    {
      school_code: 5654,
      school: "Envision Career Academy",
      is_district_office: false,
    },
    {
      school_code: 5682,
      school: "Ignite Family Academy",
      is_district_office: false,
    },
    {
      school_code: 5683,
      school: "Summit Virtual Academy",
      is_district_office: false,
    },
    {
      school_code: 8407,
      school: "Wa He Lut Indian School",
      is_district_office: false,
    },
  ],
  34033: [
    {
      school_code: 1084,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1713,
      school: "Cascadia High School",
      is_district_office: false,
    },
    {
      school_code: 2552,
      school: "Michael T Simmons Elementary",
      is_district_office: false,
    },
    {
      school_code: 2816,
      school: "Littlerock Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3199,
      school: "Peter G Schmidt Elementary",
      is_district_office: false,
    },
    {
      school_code: 3362,
      school: "Tumwater High School",
      is_district_office: false,
    },
    {
      school_code: 3612,
      school: "Tumwater Middle School",
      is_district_office: false,
    },
    {
      school_code: 3925,
      school: "Thurs Co Juv Det/Tumwater West E",
      is_district_office: false,
    },
    {
      school_code: 4205,
      school: "Black Lake Elementary",
      is_district_office: false,
    },
    {
      school_code: 4225,
      school: "New Market Skills Center",
      is_district_office: false,
    },
    {
      school_code: 4365,
      school: "East Olympia Elementary",
      is_district_office: false,
    },
    {
      school_code: 4373,
      school: "Tumwater Hill Elementary",
      is_district_office: false,
    },
    {
      school_code: 4452,
      school: "George Washington Bush Middle Sch",
      is_district_office: false,
    },
    {
      school_code: 4500,
      school: "A G West Black Hills High School",
      is_district_office: false,
    },
    {
      school_code: 5014,
      school: "New Market High School",
      is_district_office: false,
    },
    {
      school_code: 5629,
      school: "Tumwater Virtual Academy",
      is_district_office: false,
    },
  ],
  34111: [
    {
      school_code: 1035,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1768,
      school: "Avanti High School",
      is_district_office: false,
    },
    {
      school_code: 2342,
      school: "Lincoln Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2448,
      school: "Garfield Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2487,
      school: "Boston Harbor Elementary",
      is_district_office: false,
    },
    {
      school_code: 2621,
      school: "McLane Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2778,
      school: "Roosevelt Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3066,
      school: "Madison Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3132,
      school: "Olympia High School",
      is_district_office: false,
    },
    {
      school_code: 3133,
      school: "Jefferson Middle School",
      is_district_office: false,
    },
    {
      school_code: 3540,
      school: "Leland P Brown Elementary",
      is_district_office: false,
    },
    {
      school_code: 3696,
      school: "Reeves Middle School",
      is_district_office: false,
    },
    {
      school_code: 3697,
      school: "Pioneer Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3711,
      school: "Washington Middle School",
      is_district_office: false,
    },
    {
      school_code: 3960,
      school: "Capital High School",
      is_district_office: false,
    },
    {
      school_code: 4367,
      school: "Centennial Elementary Olympia",
      is_district_office: false,
    },
    {
      school_code: 4458,
      school: "McKenny Elementary",
      is_district_office: false,
    },
    {
      school_code: 4472,
      school: "Julia Butler Hansen Elementary",
      is_district_office: false,
    },
    {
      school_code: 4473,
      school: "Thurgood Marshall Middle School",
      is_district_office: false,
    },
    {
      school_code: 5078,
      school: "Olympia Regional Learning Academy",
      is_district_office: false,
    },
    {
      school_code: 5248,
      school: "Olympia Regional Learning Academy - Montessori School",
      is_district_office: false,
    },
    {
      school_code: 5259,
      school: "Touchstone",
      is_district_office: false,
    },
  ],
  34307: [
    {
      school_code: 1223,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2158,
      school: "Rainier Middle School",
      is_district_office: false,
    },
    {
      school_code: 2468,
      school: "Rainier Senior High School",
      is_district_office: false,
    },
    {
      school_code: 4486,
      school: "Rainier Elementary School",
      is_district_office: false,
    },
  ],
  34324: [
    {
      school_code: 1303,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2406,
      school: "Griffin School",
      is_district_office: false,
    },
  ],
  34401: [
    {
      school_code: 1147,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1735,
      school: "H.e.a.r.t. High School",
      is_district_office: false,
    },
    {
      school_code: 2527,
      school: "Rochester Primary School",
      is_district_office: false,
    },
    {
      school_code: 3067,
      school: "Rochester Middle School",
      is_district_office: false,
    },
    {
      school_code: 3801,
      school: "Grand Mound Elementary",
      is_district_office: false,
    },
    {
      school_code: 4326,
      school: "Rochester High School",
      is_district_office: false,
    },
    {
      school_code: 5691,
      school: "Rochester Virtual Academy",
      is_district_office: false,
    },
  ],
  34402: [
    {
      school_code: 1148,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2457,
      school: "Parkside Elementary",
      is_district_office: false,
    },
    {
      school_code: 3509,
      school: "Tenino High School",
      is_district_office: false,
    },
    {
      school_code: 3795,
      school: "Tenino Middle School",
      is_district_office: false,
    },
    {
      school_code: 4238,
      school: "Tenino Elementary School",
      is_district_office: false,
    },
  ],
  34801: [
    {
      school_code: 5305,
      school: "GRAVITY High School",
      is_district_office: false,
    },
  ],
  34901: [
    {
      school_code: 1350,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5496,
      school: "Wa He Lut Indian School",
      is_district_office: false,
    },
  ],
  34974: [
    {
      school_code: 3799,
      school: "Washington State School for the Blind",
      is_district_office: false,
    },
  ],
  34975: [
    {
      school_code: 4246,
      school: "Washington State School for the Deaf",
      is_district_office: false,
    },
  ],
  34979: [
    {
      school_code: 5302,
      school: "Washington Youth Academy",
      is_district_office: false,
    },
  ],
  35200: [
    {
      school_code: 1167,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2893,
      school: "Julius A Wendt Elementary/John C Thomas Middle School",
      is_district_office: false,
    },
    {
      school_code: 3467,
      school: "Wahkiakum High School",
      is_district_office: false,
    },
  ],
  36101: [
    {
      school_code: 1304,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2278,
      school: "Dixie Elementary School",
      is_district_office: false,
    },
  ],
  36140: [
    {
      school_code: 1016,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1772,
      school: "HomeLink",
      is_district_office: false,
    },
    {
      school_code: 2074,
      school: "Berney Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2078,
      school: "Green Park Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2159,
      school: "Prospect Point Elementary",
      is_district_office: false,
    },
    {
      school_code: 2407,
      school: "Alternative Education Program",
      is_district_office: false,
    },
    {
      school_code: 2528,
      school: "Edison Elementary School - Walla Walla",
      is_district_office: false,
    },
    {
      school_code: 2780,
      school: "Pioneer Middle School",
      is_district_office: false,
    },
    {
      school_code: 3468,
      school: "Walla Walla High School",
      is_district_office: false,
    },
    {
      school_code: 3510,
      school: "Garrison Middle School",
      is_district_office: false,
    },
    {
      school_code: 3728,
      school: "Sharpstein Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4071,
      school: "Lincoln High School",
      is_district_office: false,
    },
    {
      school_code: 4193,
      school: "Blue Ridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 5187,
      school: "HEAD START/ECEAP PRESCHOOL",
      is_district_office: false,
    },
    {
      school_code: 5337,
      school: "SE AREA TECHNICAL SKILLS CENTER",
      is_district_office: false,
    },
    {
      school_code: 5460,
      school: "Walla Walla Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5567,
      school: "ECEAP",
      is_district_office: false,
    },
    {
      school_code: 5616,
      school: "Walla Walla Center for Children and Families",
      is_district_office: false,
    },
    {
      school_code: 5636,
      school: "Walla Walla Online",
      is_district_office: false,
    },
    {
      school_code: 5705,
      school: "Walla Walla County Juvenile Detention",
      is_district_office: false,
    },
  ],
  36250: [
    {
      school_code: 1252,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2114,
      school: "Davis Elementary",
      is_district_office: false,
    },
    {
      school_code: 3541,
      school: "John Sager Middle School",
      is_district_office: false,
    },
    {
      school_code: 5362,
      school: "College Place High School",
      is_district_office: false,
    },
    {
      school_code: 5575,
      school: "College Place Open Doors Program",
      is_district_office: false,
    },
  ],
  36300: [
    {
      school_code: 1215,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2160,
      school: "Touchet Elem & High School",
      is_district_office: false,
    },
  ],
  36400: [
    {
      school_code: 1186,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3012,
      school: "Columbia Middle School",
      is_district_office: false,
    },
    {
      school_code: 3613,
      school: "Columbia Elementary",
      is_district_office: false,
    },
    {
      school_code: 4049,
      school: "Columbia High School",
      is_district_office: false,
    },
  ],
  36401: [
    {
      school_code: 1187,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2174,
      school: "Preston Hall Middle School",
      is_district_office: false,
    },
    {
      school_code: 2386,
      school: "Waitsburg High School",
      is_district_office: false,
    },
    {
      school_code: 2712,
      school: "Waitsburg Elementary School",
      is_district_office: false,
    },
  ],
  36402: [
    {
      school_code: 1216,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3574,
      school: "Prescott Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3575,
      school: "Prescott Jr Sr High",
      is_district_office: false,
    },
    {
      school_code: 5157,
      school: "Prescott Special Ed Pre-school",
      is_district_office: false,
    },
    {
      school_code: 5687,
      school: "Prescott Middle School",
      is_district_office: false,
    },
  ],
  36901: [
    {
      school_code: 5470,
      school: "Innovation Charter School",
      is_district_office: false,
    },
  ],
  37501: [
    {
      school_code: 1022,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1647,
      school: "Options High School",
      is_district_office: false,
    },
    {
      school_code: 1694,
      school: "Home Port Learning Center",
      is_district_office: false,
    },
    {
      school_code: 1799,
      school: "Visions (Seamar Youth Center)",
      is_district_office: false,
    },
    {
      school_code: 2066,
      school: "Fairhaven Middle School",
      is_district_office: false,
    },
    {
      school_code: 2067,
      school: "Roosevelt Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2075,
      school: "Whatcom Middle School",
      is_district_office: false,
    },
    {
      school_code: 2175,
      school: "Silver Beach Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2225,
      school: "Lowell Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2262,
      school: "Geneva Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2365,
      school: "Columbia Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2387,
      school: "Sunnyland Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2431,
      school: "Birchwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2553,
      school: "Bellingham High School",
      is_district_office: false,
    },
    {
      school_code: 2817,
      school: "Carl Cozier Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3134,
      school: "Happy Valley Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3200,
      school: "Alderwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3201,
      school: "Shuksan Middle School",
      is_district_office: false,
    },
    {
      school_code: 3202,
      school: "Parkview Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3576,
      school: "Sehome High School",
      is_district_office: false,
    },
    {
      school_code: 4442,
      school: "Kulshan Middle School",
      is_district_office: false,
    },
    {
      school_code: 4515,
      school: "Squalicum High School",
      is_district_office: false,
    },
    {
      school_code: 4571,
      school: "Northern Heights Elementary Schl",
      is_district_office: false,
    },
    {
      school_code: 5125,
      school: "Wade King Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5239,
      school: "Cordata Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5340,
      school: "Bellingham Re-Engagement Program",
      is_district_office: false,
    },
    {
      school_code: 5366,
      school: "Bellingham Family Partnership Program",
      is_district_office: false,
    },
  ],
  37502: [
    {
      school_code: 1073,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2263,
      school: "Beach Elem",
      is_district_office: false,
    },
    {
      school_code: 2458,
      school: "Central Elementary",
      is_district_office: false,
    },
    {
      school_code: 2488,
      school: "Ferndale High School",
      is_district_office: false,
    },
    {
      school_code: 2607,
      school: "Custer Elem",
      is_district_office: false,
    },
    {
      school_code: 3762,
      school: "Vista Middle School",
      is_district_office: false,
    },
    {
      school_code: 4130,
      school: "Skyline Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4482,
      school: "Eagleridge Elementary",
      is_district_office: false,
    },
    {
      school_code: 4554,
      school: "Horizon Middle School",
      is_district_office: false,
    },
    {
      school_code: 5084,
      school: "Ferndale Special Services",
      is_district_office: false,
    },
    {
      school_code: 5207,
      school: "Cascadia Elementary",
      is_district_office: false,
    },
    {
      school_code: 5245,
      school: "WINDWARD HIGH SCHOOL",
      is_district_office: false,
    },
    {
      school_code: 5464,
      school: "FERNDALE RE-ENGAGEMENT",
      is_district_office: false,
    },
    {
      school_code: 5474,
      school: "Parent Community Connection",
      is_district_office: false,
    },
    {
      school_code: 5579,
      school: "Ferndale Virtual Academy",
      is_district_office: false,
    },
    {
      school_code: 5655,
      school: "North Bell Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5747,
      school: "Mountain View Elementary",
      is_district_office: false,
    },
  ],
  37503: [
    {
      school_code: 1097,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2713,
      school: "Blaine Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3136,
      school: "Blaine High School",
      is_district_office: false,
    },
    {
      school_code: 3796,
      school: "Blaine Middle School",
      is_district_office: false,
    },
    {
      school_code: 4459,
      school: "Point Roberts Primary",
      is_district_office: false,
    },
    {
      school_code: 4476,
      school: "Blaine Primary School",
      is_district_office: false,
    },
    {
      school_code: 5021,
      school: "Blaine Home Connections",
      is_district_office: false,
    },
    {
      school_code: 5465,
      school: "Blaine Re-Engagement",
      is_district_office: false,
    },
  ],
  37504: [
    {
      school_code: 1098,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1914,
      school: "Lynden Special Services",
      is_district_office: false,
    },
    {
      school_code: 1983,
      school: "Lynden Academy",
      is_district_office: false,
    },
    {
      school_code: 2219,
      school: "Lynden Middle School",
      is_district_office: false,
    },
    {
      school_code: 3417,
      school: "Fisher Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4201,
      school: "Lynden High School",
      is_district_office: false,
    },
    {
      school_code: 4324,
      school: "Isom Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4517,
      school: "Vossbeck Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5466,
      school: "IMPACT Reengagement Program",
      is_district_office: false,
    },
  ],
  37505: [
    {
      school_code: 1099,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1743,
      school: "Meridian Special Programs",
      is_district_office: false,
    },
    {
      school_code: 2554,
      school: "Meridian High School",
      is_district_office: false,
    },
    {
      school_code: 2584,
      school: "Irene Reither Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3930,
      school: "Meridian Middle School",
      is_district_office: false,
    },
    {
      school_code: 5047,
      school: "Meridian Parent Partnership Program",
      is_district_office: false,
    },
    {
      school_code: 5448,
      school: "Meridian Impact Re-Engagement",
      is_district_office: false,
    },
  ],
  37506: [
    {
      school_code: 1100,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1823,
      school: "Nooksack Valley Special Services",
      is_district_office: false,
    },
    {
      school_code: 2459,
      school: "Nooksack Valley High School",
      is_district_office: false,
    },
    {
      school_code: 2489,
      school: "Sumas Elementary",
      is_district_office: false,
    },
    {
      school_code: 2687,
      school: "Nooksack Valley Middle School",
      is_district_office: false,
    },
    {
      school_code: 4428,
      school: "Everson Elementary",
      is_district_office: false,
    },
    {
      school_code: 4525,
      school: "Nooksack Elementary",
      is_district_office: false,
    },
    {
      school_code: 5554,
      school: "Nooksack Reengagement",
      is_district_office: false,
    },
  ],
  37507: [
    {
      school_code: 1101,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1936,
      school: "Educational Resource Center",
      is_district_office: false,
    },
    {
      school_code: 2343,
      school: "Mount Baker Senior High",
      is_district_office: false,
    },
    {
      school_code: 2585,
      school: "Acme Elementary",
      is_district_office: false,
    },
    {
      school_code: 3003,
      school: "Mount Baker Junior High",
      is_district_office: false,
    },
    {
      school_code: 3365,
      school: "Harmony Elementary",
      is_district_office: false,
    },
    {
      school_code: 4533,
      school: "Kendall Elementary",
      is_district_office: false,
    },
    {
      school_code: 5112,
      school: "Mount Baker Academy",
      is_district_office: false,
    },
  ],
  37902: [
    {
      school_code: 1361,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5710,
      school: "Whatcom Intergenerational High School",
      is_district_office: false,
    },
  ],
  37903: [
    {
      school_code: 1329,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5373,
      school: "Lummi Nation School",
      is_district_office: false,
    },
  ],
  38126: [
    {
      school_code: 1208,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2087,
      school: "Lacrosse Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2088,
      school: "Lacrosse High School",
      is_district_office: false,
    },
  ],
  38264: [
    {
      school_code: 1305,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3137,
      school: "Lamont Middle School",
      is_district_office: false,
    },
  ],
  38265: [
    {
      school_code: 1209,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2052,
      school: "Tekoa Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3418,
      school: "Tekoa High School",
      is_district_office: false,
    },
  ],
  38267: [
    {
      school_code: 1042,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2499,
      school: "Pullman High School",
      is_district_office: false,
    },
    {
      school_code: 2587,
      school: "Franklin Elementary",
      is_district_office: false,
    },
    {
      school_code: 3203,
      school: "Jefferson Elementary",
      is_district_office: false,
    },
    {
      school_code: 3419,
      school: "Lincoln Middle School",
      is_district_office: false,
    },
    {
      school_code: 3614,
      school: "Sunnyside Elementary",
      is_district_office: false,
    },
    {
      school_code: 5574,
      school: "Kamiak Elementary",
      is_district_office: false,
    },
  ],
  38300: [
    {
      school_code: 1123,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2894,
      school: "Leonard M Jennings Elementary",
      is_district_office: false,
    },
    {
      school_code: 3366,
      school: "Colfax High School",
      is_district_office: false,
    },
  ],
  38301: [
    {
      school_code: 1184,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1961,
      school: "Palouse at Garfield Middle School",
      is_district_office: false,
    },
    {
      school_code: 2622,
      school: "Palouse Elementary",
      is_district_office: false,
    },
    {
      school_code: 2634,
      school: "Palouse High School",
      is_district_office: false,
    },
  ],
  38302: [
    {
      school_code: 1210,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1962,
      school: "Garfield at Palouse High School",
      is_district_office: false,
    },
    {
      school_code: 2895,
      school: "Garfield Elementary",
      is_district_office: false,
    },
    {
      school_code: 2896,
      school: "Garfield Middle School",
      is_district_office: false,
    },
  ],
  38304: [
    {
      school_code: 1306,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2115,
      school: "Steptoe Elementary School",
      is_district_office: false,
    },
  ],
  38306: [
    {
      school_code: 1211,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2588,
      school: "Colton School",
      is_district_office: false,
    },
  ],
  38308: [
    {
      school_code: 1232,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2207,
      school: "Endicott/St John Elem and Middle",
      is_district_office: false,
    },
  ],
  38320: [
    {
      school_code: 1212,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3204,
      school: "Rosalia Elementary & Secondary School",
      is_district_office: false,
    },
  ],
  38322: [
    {
      school_code: 1185,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3068,
      school: "St John/Endicott High",
      is_district_office: false,
    },
    {
      school_code: 3069,
      school: "St John Elementary",
      is_district_office: false,
    },
  ],
  38324: [
    {
      school_code: 1213,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2432,
      school: "Oakesdale High School",
      is_district_office: false,
    },
    {
      school_code: 3205,
      school: "Oakesdale Elementary School",
      is_district_office: false,
    },
  ],
  38901: [
    {
      school_code: 1364,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5659,
      school: "Pullman Community Montessori",
      is_district_office: false,
    },
  ],
  39002: [
    {
      school_code: 1253,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2714,
      school: "Union Gap School",
      is_district_office: false,
    },
  ],
  39003: [
    {
      school_code: 1091,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2591,
      school: "Naches Valley High School",
      is_district_office: false,
    },
    {
      school_code: 2898,
      school: "Naches Valley Middle School",
      is_district_office: false,
    },
    {
      school_code: 5451,
      school: "Naches Valley Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5580,
      school: "Naches Valley ESD 105 Open Doors",
      is_district_office: false,
    },
  ],
  39007: [
    {
      school_code: 1006,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2116,
      school: "Davis High School",
      is_district_office: false,
    },
    {
      school_code: 2176,
      school: "Garfield Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2177,
      school: "Mckinley Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2314,
      school: "Washington Middle School",
      is_district_office: false,
    },
    {
      school_code: 2410,
      school: "Franklin Middle School",
      is_district_office: false,
    },
    {
      school_code: 2433,
      school: "Ridgeview Elementary",
      is_district_office: false,
    },
    {
      school_code: 2529,
      school: "Roosevelt Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2592,
      school: "Adams Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2715,
      school: "Hoover Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2818,
      school: "Gilbert Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2819,
      school: "Nob Hill Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2899,
      school: "Mcclure Elementary School Yakima",
      is_district_office: false,
    },
    {
      school_code: 3023,
      school: "K-8 Learning Lab",
      is_district_office: false,
    },
    {
      school_code: 3138,
      school: "Barge-Lincoln Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3206,
      school: "Eisenhower High School",
      is_district_office: false,
    },
    {
      school_code: 3264,
      school: "Robertson Elementary",
      is_district_office: false,
    },
    {
      school_code: 3312,
      school: "Whitney Elementary Yakima",
      is_district_office: false,
    },
    {
      school_code: 3368,
      school: "Wilson Middle School",
      is_district_office: false,
    },
    {
      school_code: 3615,
      school: "Lewis & Clark Middle School",
      is_district_office: false,
    },
    {
      school_code: 3817,
      school: "Martin Luther King Jr Elementary",
      is_district_office: false,
    },
    {
      school_code: 4020,
      school: "Yakima Valley Technical Skills Center",
      is_district_office: false,
    },
    {
      school_code: 4092,
      school: "Juvenile Detention Center",
      is_district_office: false,
    },
    {
      school_code: 4093,
      school: "Stanton Academy",
      is_district_office: false,
    },
    {
      school_code: 5019,
      school: "Early Childhood Center",
      is_district_office: false,
    },
    {
      school_code: 5153,
      school: "Yakima Online",
      is_district_office: false,
    },
    {
      school_code: 5224,
      school: "Yakima Satellite Alternative Programs",
      is_district_office: false,
    },
    {
      school_code: 5263,
      school: "Yakima Adult Jail",
      is_district_office: false,
    },
    {
      school_code: 5264,
      school: "Ridgeview Group Home",
      is_district_office: false,
    },
    {
      school_code: 5355,
      school: "Yakima Open Doors",
      is_district_office: false,
    },
  ],
  39090: [
    {
      school_code: 1092,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2344,
      school: "East Valley High School",
      is_district_office: false,
    },
    {
      school_code: 2530,
      school: "Moxee Elementary",
      is_district_office: false,
    },
    {
      school_code: 2821,
      school: "Terrace Heights Elementary",
      is_district_office: false,
    },
    {
      school_code: 4055,
      school: "East Valley Central Middle School",
      is_district_office: false,
    },
    {
      school_code: 4487,
      school: "East Valley Elementary",
      is_district_office: false,
    },
  ],
  39119: [
    {
      school_code: 1071,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2388,
      school: "Selah High School",
      is_district_office: false,
    },
    {
      school_code: 4272,
      school: "Selah Academy Online",
      is_district_office: false,
    },
    {
      school_code: 5231,
      school: "Selah HomeLink",
      is_district_office: false,
    },
    {
      school_code: 5232,
      school: "Robert Lince Early Learning Center",
      is_district_office: false,
    },
    {
      school_code: 5334,
      school: "SELAH ACADEMY REENGAGEMENT PROGRAM",
      is_district_office: false,
    },
    {
      school_code: 5383,
      school: "John Campbell Primary School",
      is_district_office: false,
    },
    {
      school_code: 5384,
      school: "Selah Intermediate School",
      is_district_office: false,
    },
    {
      school_code: 5385,
      school: "Selah Middle School",
      is_district_office: false,
    },
    {
      school_code: 5560,
      school: "Selah Academy Auxiliary",
      is_district_office: false,
    },
    {
      school_code: 5561,
      school: "Selah Academy BPL",
      is_district_office: false,
    },
  ],
  39120: [
    {
      school_code: 1157,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 3070,
      school: "Artz Fox Elementary",
      is_district_office: false,
    },
    {
      school_code: 5289,
      school: "Mabton Jr. Sr. High",
      is_district_office: false,
    },
    {
      school_code: 5443,
      school: "Mabton Step Up To College",
      is_district_office: false,
    },
  ],
  39200: [
    {
      school_code: 1072,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1645,
      school: "Compass High School",
      is_district_office: false,
    },
    {
      school_code: 1776,
      school: "Contract Learning Center",
      is_district_office: false,
    },
    {
      school_code: 2345,
      school: "Mcclure Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2555,
      school: "Grandview High School",
      is_district_office: false,
    },
    {
      school_code: 2756,
      school: "Thompson Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3013,
      school: "Smith Elementary School",
      is_district_office: false,
    },
    {
      school_code: 3071,
      school: "Grandview Middle School",
      is_district_office: false,
    },
    {
      school_code: 5399,
      school: "Step Up to College Open Doors High School",
      is_district_office: false,
    },
  ],
  39201: [
    {
      school_code: 1046,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2469,
      school: "Outlook Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2717,
      school: "Washington Elementary",
      is_district_office: false,
    },
    {
      school_code: 2959,
      school: "Sunnyside High School",
      is_district_office: false,
    },
    {
      school_code: 3313,
      school: "Harrison Middle School",
      is_district_office: false,
    },
    {
      school_code: 4000,
      school: "Chief Kamiakin Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4497,
      school: "Pioneer Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5049,
      school: "Sierra Vista Middle School",
      is_district_office: false,
    },
    {
      school_code: 5137,
      school: "Sun Valley Elementary",
      is_district_office: false,
    },
    {
      school_code: 5352,
      school: "SHS Graduation Alliance",
      is_district_office: false,
    },
  ],
  39202: [
    {
      school_code: 1047,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 1508,
      school: "Computer Academy Toppenish High School",
      is_district_office: false,
    },
    {
      school_code: 1831,
      school: "Toppenish Pre School",
      is_district_office: false,
    },
    {
      school_code: 2264,
      school: "Toppenish Middle School",
      is_district_office: false,
    },
    {
      school_code: 2608,
      school: "Garfield Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2635,
      school: "Lincoln Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2900,
      school: "Toppenish High School",
      is_district_office: false,
    },
    {
      school_code: 4106,
      school: "Kirkwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4588,
      school: "Valley View Elementary",
      is_district_office: false,
    },
    {
      school_code: 5262,
      school: "NW Allprep",
      is_district_office: false,
    },
  ],
  39203: [
    {
      school_code: 1130,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2718,
      school: "Highland Junior High School",
      is_district_office: false,
    },
    {
      school_code: 3072,
      school: "Marcus Whitman-Cowiche Elementary",
      is_district_office: false,
    },
    {
      school_code: 3073,
      school: "Tieton Intermediate School",
      is_district_office: false,
    },
    {
      school_code: 4559,
      school: "Highland High School",
      is_district_office: false,
    },
    {
      school_code: 5576,
      school: "Highland ESD 105 Open Doors",
      is_district_office: false,
    },
  ],
  39204: [
    {
      school_code: 1093,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2531,
      school: "Granger Middle School",
      is_district_office: false,
    },
    {
      school_code: 3314,
      school: "Granger High School",
      is_district_office: false,
    },
    {
      school_code: 4535,
      school: "Roosevelt Elementary",
      is_district_office: false,
    },
  ],
  39205: [
    {
      school_code: 1158,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2240,
      school: "Zillah High School",
      is_district_office: false,
    },
    {
      school_code: 2783,
      school: "Hilton Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4221,
      school: "Zillah Intermediate School",
      is_district_office: false,
    },
    {
      school_code: 4481,
      school: "Zillah Middle School",
      is_district_office: false,
    },
  ],
  39207: [
    {
      school_code: 1048,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2131,
      school: "Wapato Middle School",
      is_district_office: false,
    },
    {
      school_code: 2757,
      school: "Satus Elementary",
      is_district_office: false,
    },
    {
      school_code: 2960,
      school: "Camas Elementary",
      is_district_office: false,
    },
    {
      school_code: 3141,
      school: "Wapato High School",
      is_district_office: false,
    },
    {
      school_code: 4022,
      school: "Pace Alternative High School",
      is_district_office: false,
    },
    {
      school_code: 4518,
      school: "Adams Elementary",
      is_district_office: false,
    },
    {
      school_code: 5543,
      school: "Simcoe Elementary School",
      is_district_office: false,
    },
    {
      school_code: 5544,
      school: "Camas Elementary",
      is_district_office: false,
    },
    {
      school_code: 5595,
      school: "Wapato ESD 105 Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5723,
      school: "Wapato Online Academy K-5",
      is_district_office: false,
    },
    {
      school_code: 5724,
      school: "Wapato Online Academy 6-8",
      is_district_office: false,
    },
    {
      school_code: 5725,
      school: "Wapato Online Academy 9-12",
      is_district_office: false,
    },
  ],
  39208: [
    {
      school_code: 1049,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2505,
      school: "Wide Hollow Elementary",
      is_district_office: false,
    },
    {
      school_code: 2758,
      school: "Mountainview Elementary",
      is_district_office: false,
    },
    {
      school_code: 2822,
      school: "Ahtanum Valley Elementary",
      is_district_office: false,
    },
    {
      school_code: 3074,
      school: "West Valley High School",
      is_district_office: false,
    },
    {
      school_code: 3207,
      school: "Summitview Elementary",
      is_district_office: false,
    },
    {
      school_code: 3699,
      school: "Apple Valley Elementary",
      is_district_office: false,
    },
    {
      school_code: 4040,
      school: "West Valley Jr High",
      is_district_office: false,
    },
    {
      school_code: 4448,
      school: "Cottonwood Elementary School",
      is_district_office: false,
    },
    {
      school_code: 4506,
      school: "West Valley Middle School",
      is_district_office: false,
    },
    {
      school_code: 5008,
      school: "West Valley Preschool",
      is_district_office: false,
    },
    {
      school_code: 5096,
      school: "Children's Village",
      is_district_office: false,
    },
    {
      school_code: 5221,
      school: "West Valley High School Freshman Campus",
      is_district_office: false,
    },
    {
      school_code: 5504,
      school: "WEST VALLEY VIRTUAL ACADEMY K-6",
      is_district_office: false,
    },
    {
      school_code: 5505,
      school: "WEST VALLEY VIRTUAL ACADEMY 7-8",
      is_district_office: false,
    },
    {
      school_code: 5506,
      school: "WEST VALLEY VIRTUAL ACADEMY 9-12",
      is_district_office: false,
    },
    {
      school_code: 5540,
      school: "West Valley Open Doors",
      is_district_office: false,
    },
    {
      school_code: 5620,
      school: "West Valley Virtual University",
      is_district_office: false,
    },
    {
      school_code: 5699,
      school: "West Valley Innovation Center",
      is_district_office: false,
    },
  ],
  39209: [
    {
      school_code: 1131,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 2389,
      school: "Mount Adams Middle School",
      is_district_office: false,
    },
    {
      school_code: 2506,
      school: "Harrah Elementary School",
      is_district_office: false,
    },
    {
      school_code: 2532,
      school: "White Swan High School",
      is_district_office: false,
    },
    {
      school_code: 5233,
      school: "American Academy",
      is_district_office: false,
    },
  ],
  39801: [
    {
      school_code: 5578,
      school: "ESD 105 Open Doors",
      is_district_office: false,
    },
  ],
  39901: [
    {
      school_code: 1356,
      school: "District Office",
      is_district_office: true,
    },
    {
      school_code: 5550,
      school: "Yakama Nation School",
      is_district_office: false,
    },
  ],
};

export default ALL_SCHOOLS;


