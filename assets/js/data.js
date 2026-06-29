/*
 * Structured content for the School and Classroom Support Team (SCST) web app.
 * Source: "School and Classroom Support Team DRAFT.docx" (Louis Riel School Division).
 *
 * Keeping content in a single structured file makes it easy to update names,
 * roles, and bios without touching the markup or interaction logic.
 */

const SCST = {
  org: {
    name: "School and Classroom Support Team",
    acronym: "SCST",
    division: "Louis Riel School Division",
    tagline:
      "Supporting Every School. Strengthening Every Classroom. Ensuring Every Student Thrives.",
  },

  whoWeAre: {
    intro:
      "The School and Classroom Support Team (SCST) partners with schools across the Louis Riel School Division to strengthen student learning, well-being, and belonging.",
    groundedIn: [
      "Equity and reconciliation",
      "Evidence-informed practice",
      "Strong, relational partnerships with school teams and communities",
    ],
    workAlongside: [
      "Build instructional and system capacity",
      "Respond to identified student and school needs",
      "Close opportunity gaps—particularly for Indigenous students and learners experiencing barriers",
    ],
    summary:
      "SCST is a coordinated, system-level team that integrates leadership, instructional support, clinical services, Indigenous education, and specialized supports into one aligned model.",
  },

  whyItMatters: {
    intro:
      "Divisional data—including literacy and numeracy screening, progress monitoring, attendance, and well-being indicators—continues to highlight:",
    highlights: [
      "Persistent achievement gaps across schools",
      "Disproportionate impact on Indigenous students",
      "Students with multiple indicators of risk (academic, engagement, attendance)",
    ],
    prioritizes: [
      "Schools with the greatest need receive more intensive and coordinated support",
      "Supports are constantly monitored and adjusted based on impact",
    ],
    strategicPlan: [
      "Closing opportunity gaps",
      "Strengthening responsive instruction",
      "Supporting belonging and well-being",
      "Embedding Indigenous education and reconciliation",
    ],
  },

  howWeSupport: {
    intro:
      "SCST collaborates with schools through differentiated, data-informed support to:",
    actions: [
      "Analyze data",
      "Strengthen instructional practice",
      "Support professional learning",
      "Mentor staff",
      "Build inclusive and culturally responsive environments",
    ],
  },

  tiers: [
    {
      id: "tier1",
      level: "Tier 1",
      name: "Universal Support",
      shortLabel: "Universal",
      summary:
        "All schools receive universal support focused on building strong, inclusive, and responsive learning environments.",
      includes: [
        "Access to divisional professional learning opportunities",
        "Universal resources, tools, and frameworks to support teaching and learning",
        "Consultation upon request",
        "Support for implementing divisional priorities (e.g., literacy, numeracy, well-being, Indigenous education)",
        "Opportunities for networking and collaboration across schools",
      ],
      goal:
        "Universal support emphasizes proactive capacity building to ensure all students experience a high-quality, equitable learning environment.",
    },
    {
      id: "tier2",
      level: "Tier 2",
      name: "Targeted Support",
      shortLabel: "Targeted",
      summary:
        "Schools in Tier 2 receive targeted, short- to medium-term support focused on specific areas of need identified through data and school context.",
      includes: [
        "Planned cycles of support (e.g., coaching, consultation, or collaborative inquiry)",
        "Support with implementing evidence-informed strategies",
        "Joint problem-solving with school teams and leadership",
        "Professional learning tailored to identified priorities (e.g., literacy, regulation, inclusion)",
        "Check-ins to monitor progress and adjust supports as needed",
      ],
      goal:
        "The goal of Tier 2 support is to strengthen key practices, build staff confidence and skill, and address emerging needs before they intensify.",
    },
    {
      id: "tier3",
      level: "Tier 3",
      name: "Intensive Support",
      shortLabel: "Intensive",
      summary:
        "Schools identified for Tier 3 support receive the highest level of involvement from SCST. Support is frequent, collaborative, and responsive to complex or urgent needs.",
      includes: [
        "Ongoing, embedded support from multidisciplinary team members",
        "Regular in-school presence to co-plan, co-teach, and model practices",
        "Intensive data analysis and progress monitoring",
        "Support with comprehensive school-based action planning",
        "Coordination with external agencies and specialized services",
        "Focused efforts to address significant gaps in student achievement, well-being, or engagement",
      ],
      goal:
        "The goal of Tier 3 support is to stabilize systems, address immediate needs, and build sustainable structures for continued growth.",
    },
  ],

  dataSources: [
    "Literacy and numeracy screening",
    "Progress monitoring data",
    "Attendance and well-being indicators",
    "Indigenous student gap indicators",
    "Classroom and school context",
  ],
  dataEnsures: [
    "Early identification of students requiring support",
    "Targeted and responsive intervention",
    "Ongoing monitoring and adjustment",
  ],

  // Six integrated areas of support. Each area lists its purpose, key work,
  // and team members (optionally grouped into sub-teams).
  areas: [
    {
      id: "leadership",
      number: 1,
      name: "Leadership",
      icon: "compass",
      purpose:
        "Leadership ensures system coherence, alignment to the Multi-Year Strategic Plan, and coordinated support across all SCST areas.",
      keyWork: [
        "Align supports to divisional priorities and data",
        "Coordinate cross-team collaboration",
        "Respond to emerging school needs",
        "Ensure equity-driven decision-making",
      ],
      members: [
        {
          name: "Nicholas Kelly",
          role: "Director of School and Classroom Support",
          bio: "Nicholas provides overall leadership for the School and Classroom Support Team, ensuring coordinated, responsive, and equity-focused support across the division. He works closely with school and divisional leaders to align services, strengthen system coherence, and improve outcomes for all students.",
        },
        {
          name: "Nicole Mager",
          role: "Divisional Principal (Instructional & Indigenous Education)",
          bio: "Nicole leads instructional and Indigenous education supports across the division. She partners with schools to strengthen teaching practices, advance culturally responsive learning, and support meaningful, engaging learning experiences for all students.",
        },
        {
          name: "Megan Vankoughnett",
          role: "Divisional Principal (Clinical & Student Services)",
          bio: "Megan provides leadership for clinical and student services, supporting inclusive and responsive learning environments. She works collaboratively with schools to ensure student needs are met through coordinated, evidence-informed approaches.",
        },
        {
          name: "Lisa Tymchuk",
          role: "Assistant Director, Clinical Services",
          bio: "Lisa supports the delivery of clinical services across the division, helping to coordinate interdisciplinary supports for students. She works with school teams to strengthen practices that support student learning, communication, regulation, and well-being.",
        },
        {
          name: "Kelsey Lenaghan",
          role: "Divisional Indigenous Leader",
          bio: "Kelsey leads Indigenous education and intercultural understandings across the division. She works alongside schools to strengthen relationships, support Indigenous Education School-based Action Planning, and embed Indigenous perspectives, identities, and ways of knowing into learning.",
        },
      ],
    },
    {
      id: "instructional",
      number: 2,
      name: "Instructional Support",
      subtitle: "Literacy & Numeracy",
      icon: "book",
      purpose:
        "Instructional support strengthens classroom practice, improves student achievement, and builds teacher capacity.",
      keyWork: [
        "Early screening and progress monitoring",
        "Structured literacy and numeracy practices",
        "Intervention planning",
        "Co-planning and co-teaching",
        "Instructional coaching and mentorship",
        "Data-informed instructional decision-making",
      ],
      members: [
        {
          name: "Kristyn Artibise",
          role: "Instructional Support Teacher (Numeracy)",
          bio: "Kristyn supports schools in strengthening numeracy instruction through data-informed practices, targeted intervention planning, and collaborative problem solving. She works alongside educators to build confidence and capacity in teaching mathematics so all students can experience success.",
        },
        {
          name: "Kristen McDowell",
          role: "Instructional Support Teacher (Literacy)",
          bio: "Kristen partners with schools to strengthen literacy instruction using structured, evidence-informed approaches. She supports educators through coaching, co-planning, and the use of data to guide responsive instruction and improve student outcomes.",
        },
        {
          name: "Geneviève Shyiak",
          role: "Instructional Support Teacher (Literacy)",
          bio: "Geneviève works collaboratively with school teams to enhance literacy learning and instructional practice. She supports teachers in using data to inform instruction, monitor progress, and create responsive learning environments that meet the needs of all students.",
        },
      ],
    },
    {
      id: "student-services",
      number: 3,
      name: "Student Support Services",
      icon: "users",
      purpose:
        "Student Support Services creates inclusive, responsive environments that address academic, behavioural, and social-emotional needs.",
      keyWork: [
        "MEECL, RAF, and TCIS frameworks",
        "Mentor support for new teachers",
        "Transitions planning",
        "Student-centered data use",
        "Support for multilingual learners",
      ],
      members: [
        {
          name: "Kerri Bush",
          role: "Instructional Support / Student Services",
          bio: "Kerri supports schools in creating inclusive and responsive learning environments that meet the diverse needs of students. She works alongside educators to strengthen classroom practices, support social-emotional learning, and build strategies that enhance student well-being and engagement.",
        },
        {
          name: "Rose Pagtakhan",
          role: "Instructional Support / Student Services",
          bio: "Rose specializes in supporting multilingual learners across the division. She partners with teachers to design inclusive, language-rich instruction that supports both academic achievement and language development, helping students feel confident, capable, and connected in their learning.",
        },
      ],
    },
    {
      id: "indigenous-education",
      number: 4,
      name: "Indigenous Education",
      icon: "feather",
      purpose:
        "The Indigenous Education Team partners with schools to advance Indigenous student success through culture, identity, and relationship.",
      keyWork: [
        "Indigenous Education School-Based Action Plans (IESAP)",
        "Data analysis and goal setting",
        "Cultural teachings and land-based learning",
        "Language programming",
        "Connection to Elders and Knowledge Keepers",
      ],
      process: {
        title: "IESAP Process",
        intro: "Schools:",
        steps: [
          "Form Indigenous Education Action Teams",
          "Analyze data and community voice",
          "Identify strengths and barriers",
          "Develop and implement action plans",
        ],
      },
      subteams: [
        {
          name: "Indigenous Education Team",
          members: [
            {
              name: "Sean Oliver",
              role: "Indigenous Education",
              bio: "Sean supports schools through land-based learning, cultural teachings, and Indigenous Education School-based Action Planning. He works alongside students and staff to strengthen connection to culture, identity, and community, helping create meaningful learning experiences rooted in relationship.",
            },
            {
              name: "Rose Bird",
              role: "Indigenous Education",
              bio: "Rose partners with schools to support Indigenous language, culture, identity and Indigenous Education School-based Action Planning. She works with educators and students to deepen understanding, strengthen belonging, and create inclusive learning environments grounded in respect and connection.",
            },
            {
              name: "Judith Saunders-McKay",
              role: "Indigenous Education",
              bio: "Judith supports Indigenous education in schools through language, cultural learning, relationship-building and Indigenous Education School-based Action Planning. She works collaboratively with staff and students to foster understanding, respect, and a strong sense of identity and belonging.",
            },
            {
              name: "Sam Flamand",
              role: "Indigenous Education",
              bio: "Sam supports Indigenous language and cultural learning across schools and Indigenous Education School-based Action Planning. She works alongside educators to strengthen culturally responsive practices and helps create spaces where students feel seen, valued, and connected.",
            },
            {
              name: "Trish Wilson",
              role: "Indigenous Education",
              bio: "Trish works with schools to support Indigenous education through cultural programming, relationship-building, student engagement and Indigenous Education School-based Action Planning. She also supports staff learning and contributes to creating inclusive and welcoming school environments.",
            },
            {
              name: "Tammy Bruce",
              role: "Community Liaison – Indigenous Academic Support",
              bio: "Tammy connects students, families, schools, and community supports. She plays a key role in strengthening relationships, supporting student well-being, and ensuring that schools are responsive to the needs and strengths of the communities they serve.",
            },
          ],
        },
        {
          name: "Indigenous Language Team",
          members: [
            {
              name: "Alice McKay",
              role: "Ojibwe Teacher",
              bio: "Alice teaches Ojibwe language and supports students in developing strong connections to language, culture, identity and supports Indigenous Education School-based Action Planning. Her work helps create meaningful opportunities for students to learn through language and deepen their understanding of Indigenous ways of knowing.",
            },
            {
              name: "Courtney Pranteau",
              role: "Cree Teacher",
              bio: "Courtney teaches Cree language and works with students to build confidence and connection through language learning while supporting Indigenous Education School-based Action Planning. She supports cultural understanding and helps create spaces where students can explore identity and belonging.",
            },
            {
              name: "Maxine Lavitt",
              role: "Michif Instructor",
              bio: "Maxine teaches Michif, supporting language revitalization and cultural connection for students and supports Indigenous Education School-based Action Planning. Her work strengthens identity, pride, and understanding of Métis culture through meaningful learning experiences.",
            },
            {
              name: "Cub Spring",
              role: "Ojibwe Instructor",
              bio: "Cub supports students in learning Ojibwe language while fostering connection to culture and community while supporting Indigenous Education School-based Action Planning. He works alongside schools to create engaging and meaningful language learning opportunities.",
            },
            {
              name: "Rhea Paul",
              role: "Ojibwe Instructor",
              bio: "Rhea supports Ojibwe language learning across schools, helping students develop communication skills and cultural understanding and supports Indigenous Education School-based Action Planning. Her work contributes to strengthening identity and belonging through language.",
            },
            {
              name: "Alyssa Guimond",
              role: "Ojibwe Instructor",
              bio: "Alyssa supports students in learning Ojibwe language in ways that are engaging and responsive while supporting Indigenous Education School-based Action Planning. She works with school teams to support language development and cultural connection.",
            },
            {
              name: "Hailey McKay",
              role: "Cree Instructor",
              bio: "Hailey supports Cree language learning and works with students to build connection, confidence, cultural understanding while supporting Indigenous Education School-based Action Planning. She helps create inclusive learning environments where language and identity are valued.",
            },
            {
              name: "Destanee Ducharme",
              role: "Cree Instructor",
              bio: "Destanee supports Cree language instruction and works with students to strengthen their understanding of culture, identity, and community and supports Indigenous Education School-based Action Planning. Her work helps create meaningful and connected learning experiences.",
            },
            {
              name: "Rose McKay",
              role: "Cree Instructor",
              bio: "Rose supports Cree language learning through relationship, storytelling, cultural connection while supporting Indigenous Education School-based Action Planning. She works with students to build confidence and pride in language and identity.",
            },
          ],
        },
      ],
    },
    {
      id: "clinical",
      number: 5,
      name: "Clinical Services",
      icon: "heart",
      purpose:
        "Clinical Services supports communication, regulation, and well-being through interdisciplinary collaboration.",
      keyWork: [
        "Occupational Therapy",
        "Psychology",
        "Speech Language Pathology",
        "Social Work",
        "Social-emotional and regulation support",
        "Transition planning",
        "Professional learning for staff",
      ],
      members: [
        {
          name: "Robert George",
          role: "Psychologist",
          bio: "Robert supports schools through assessment, consultation, and collaborative problem solving. He works alongside educators to better understand student learning and well-being needs, helping to guide effective, data-informed supports and interventions.",
        },
        {
          name: "Travis Hoare",
          role: "Occupational Therapist",
          bio: "Travis supports students in developing skills related to self-regulation, independence, and participation in learning. He works with school teams to design inclusive, responsive strategies that help students succeed in their daily classroom environments.",
        },
        {
          name: "Karla Guiterrez",
          role: "Speech Language Pathologist",
          bio: "Karla supports students and educators in strengthening communication, language development, and literacy foundations. She collaborates with school teams to implement strategies that support student learning, engagement, and participation across all areas of the classroom.",
        },
        {
          name: "Kim Mackey",
          role: "Social Worker",
          bio: "Kim supports students’ social-emotional well-being, mental health, and overall sense of belonging within the school community. She collaborates with educators, families and caregivers, and community partners to provide responsive supports that help students navigate challenges, build resilience, and engage fully in their learning.",
        },
      ],
    },
    {
      id: "specialized",
      number: 6,
      name: "Specialized Supports",
      icon: "star",
      purpose:
        "Specialized supports enhance school programming, engagement, and discipline-specific instruction.",
      keyWork: [
        "Library Services",
        "Physical Education & Healthy Living",
        "Extra-Curricular Athletics",
        "LRSD Arts (Music, Visual Arts, Drama)",
        "Applied Technology and Human Ecology",
      ],
      members: [
        {
          name: "Kathy Atkin",
          role: "Divisional Teacher Librarian (Libraries)",
          bio: "Kathy supports school libraries across the division, helping to create welcoming, literacy-rich environments that foster a love of reading and inquiry. She partners with educators to enhance access to diverse resources and strengthen teaching and learning through library programming.",
        },
        {
          name: "Shaemus Campbell",
          role: "Physical Education & Healthy Living",
          bio: "Shaemus supports high-quality physical education and promotes active, healthy lifestyles for students. He works alongside teachers to strengthen physical education programming, mentor educators, and coordinate divisional events that engage students in physical activity and well-being.",
        },
        {
          name: "Jordana Milne",
          role: "Manager of Athletics and Healthy Living",
          bio: "Jordana leads and coordinates divisional extra-curricular athletics, supporting schools in offering inclusive and engaging sport opportunities. She works with staff to build strong school-based programs and helps create positive experiences for students through athletics and teamwork.",
        },
        {
          name: "Ryan Sabourin",
          role: "Applied Technology / Human Ecology",
          bio: "Ryan supports applied technology and human ecology programming across the division. He works with schools to create safe, innovative, and engaging learning experiences that prepare students with practical skills and real-world connections.",
        },
        {
          name: "Allan Suban",
          role: "LRSD Arts (Music, Visual Arts, Drama)",
          bio: "Allan supports arts programming in schools, helping to foster creativity, expression, and student engagement. He works with educators to strengthen music, visual arts and drama experiences that enrich learning and build student confidence.",
        },
      ],
    },
  ],

  schoolBased: {
    intro: [
      "The School and Classroom Support Team (SCST) provides supports based on a combination of divisional data, school-level context, and identified student and staff needs. This responsive approach ensures that resources are aligned to where they will have the greatest impact, while also building long-term capacity across all schools.",
      "SCST works in partnership with school teams to analyze data (e.g., achievement, well-being, attendance, and engagement) and to co-develop plans that are strengths-based, culturally responsive, and focused on improving outcomes for all learners.",
    ],
    equityModelIntro:
      "SCST uses a tiered model to differentiate levels of support across schools. This model allows for targeted allocation of time, expertise, and resources while maintaining a strong focus on equity, inclusion, and capacity building.",
    embeddedRationale: {
      intro: "Staff are assigned to schools based on:",
      factors: [
        "Indigenous student opportunity gaps",
        "Attendance and engagement indicators",
        "Literacy and numeracy data",
        "Number of students with multiple risk factors",
        "Need for sustained relational support",
      ],
    },
    currentDirection: [
      {
        title: "Literacy (2026–2027)",
        points: [
          "Wave-based support model across priority schools",
          "Focused on highest-need schools identified through data",
        ],
      },
      {
        title: "Numeracy (2026–2027)",
        points: [
          "Wave-based support model across priority schools",
          "Focused on highest-need schools identified through data",
        ],
      },
    ],
  },

  lookingAhead: {
    intro: "SCST continues to evolve to:",
    points: [
      "Increase embedded, in-school support",
      "Strengthen collaboration across teams",
      "Refine data-informed decision-making",
      "Expand impact through tiered instructional models",
      "Improve outcomes for students, particularly those experiencing barriers",
    ],
    mentorship:
      "Specialized Teacher Mentorship (Library, Phys. Ed, Music, Applied Technology, Human Ecology, Student Services, Teachers New To LRSD)",
  },
};

// Expose for browser usage.
if (typeof window !== "undefined") {
  window.SCST = SCST;
}
