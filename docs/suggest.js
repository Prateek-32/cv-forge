/* Type-ahead suggestions for the briefs on start.html.

   Start typing in a role, skills, education, certification, city, employer or
   language box and matching entries appear below it: "soft" offers Software
   Developer, "sal" offers Salesforce, "bt" offers B.Tech. Pick one with a tap,
   a click, or the arrow keys and Enter. Anything not in the lists can still be
   typed freely — the lists only save typing.

   Everything is local (no network, nothing sent anywhere). Entries for the
   profession chosen in the brief come first. Multi-value boxes (skills,
   certifications, languages, target roles, education) complete the part after
   the last comma or line break, and add a comma after each pick.

   Lists: pipes separate entries; one list per profession where it matters.
   Profession keys follow the order of the "Your field" select. */

(function () {
  'use strict';

  var FIELDS = ['finance', 'sales', 'law', 'consulting', 'engineering', 'data', 'trades',
                'creative', 'art', 'film', 'writing', 'healthcare', 'teaching', 'academia'];

  var TITLES = {
    all: 'Intern|Trainee|Management Trainee|Graduate Trainee|Fresher|Customer Support Executive|Customer Service Representative|Office Assistant|Administrative Assistant|Executive Assistant|Front Office Executive|Receptionist|Data Entry Operator|Back Office Executive|Team Leader|Team Lead|Store Manager|Cashier|Telecaller|Call Centre Executive|Operations Executive|General Manager|Freelancer|Founder|Co-founder|Consultant',
    finance: 'Accountant|Senior Accountant|Chartered Accountant (CA)|Financial Analyst|Senior Financial Analyst|FP&A Analyst|FP&A Manager|Investment Banking Analyst|Investment Banking Associate|Equity Research Analyst|Credit Analyst|Credit Manager|Risk Analyst|Risk Manager|Audit Associate|Internal Auditor|Statutory Auditor|Tax Consultant|Tax Manager|GST Consultant|Finance Manager|Financial Controller|Chief Financial Officer (CFO)|Treasury Analyst|Accounts Executive|Accounts Payable Executive|Accounts Receivable Executive|Payroll Executive|Relationship Manager|Wealth Manager|Branch Manager|Loan Officer|Portfolio Manager|Fund Accountant|Compliance Analyst|Actuarial Analyst|Insurance Advisor|Business Finance Partner|Cost Accountant|Article Assistant',
    sales: 'Sales Executive|Sales Manager|Area Sales Manager|Regional Sales Manager|Business Development Executive (BDE)|Business Development Manager (BDM)|Account Executive|Key Account Manager|Inside Sales Representative|Sales Development Representative (SDR)|Customer Success Manager|Channel Sales Manager|Territory Sales Manager|Pre-Sales Consultant|Marketing Executive|Marketing Manager|Digital Marketing Executive|Digital Marketing Manager|SEO Specialist|SEO Executive|Performance Marketing Manager|Social Media Manager|Social Media Executive|Content Marketing Manager|Brand Manager|Product Marketing Manager|Growth Marketing Manager|Email Marketing Specialist|Marketing Analyst|Retail Store Manager|VP Sales|Head of Sales|Head of Marketing|Chief Marketing Officer (CMO)|E-commerce Manager|PR Executive|Field Sales Executive|Medical Representative',
    law: 'Associate|Senior Associate|Legal Associate|Advocate|Legal Counsel|Senior Legal Counsel|In-house Counsel|General Counsel|Company Secretary (CS)|Compliance Officer|Compliance Manager|Legal Manager|Paralegal|Legal Analyst|Contract Manager|Litigation Associate|Corporate Lawyer|Law Clerk|Legal Intern|IP Associate|Data Protection Officer|Legal Executive',
    consulting: 'Business Analyst (BA)|Senior Business Analyst|Consultant|Senior Consultant|Associate Consultant|Management Consultant|Strategy Consultant|Engagement Manager|Project Manager (PM)|Program Manager|Operations Manager|Process Excellence Manager|Supply Chain Manager|Procurement Manager|Purchase Executive|Logistics Manager|Business Operations Analyst|Product Manager|Associate Product Manager (APM)|Chief of Staff|HR Business Partner (HRBP)|HR Executive|HR Manager|Talent Acquisition Specialist|Recruiter|Operations Head|Scrum Master|Project Coordinator',
    engineering: 'Software Engineer (SWE)|Senior Software Engineer|Software Developer|Software Development Engineer (SDE)|SDE II|Full Stack Developer|Frontend Developer|Backend Developer|Java Developer|Python Developer|.NET Developer|React Developer|Node.js Developer|Android Developer|iOS Developer|Mobile App Developer|Flutter Developer|DevOps Engineer|Site Reliability Engineer (SRE)|Cloud Engineer|Solutions Architect|Technical Lead|Engineering Manager|QA Engineer|Test Automation Engineer|Software Tester|Security Engineer|Cybersecurity Analyst|Embedded Software Engineer|Network Engineer|System Administrator|Salesforce Developer|SAP Consultant|Mechanical Engineer|Civil Engineer|Electrical Engineer|Electronics Engineer|Design Engineer|Production Engineer|Quality Engineer|Project Engineer|Site Engineer|Chemical Engineer|Graduate Engineer Trainee (GET)|Chief Technology Officer (CTO)|IT Support Engineer',
    data: 'Data Analyst|Senior Data Analyst|Business Intelligence (BI) Analyst|BI Developer|Power BI Developer|Data Scientist|Senior Data Scientist|Machine Learning Engineer|AI Engineer|Generative AI Engineer|Data Engineer|Analytics Engineer|Analytics Manager|MIS Executive|Reporting Analyst|Product Analyst|Research Analyst|Quantitative Analyst|Statistician|NLP Engineer|Computer Vision Engineer|Data Architect|Head of Data',
    trades: 'Electrician|Master Electrician|Plumber|Welder|Fitter|Machinist|CNC Operator|HVAC Technician|Site Supervisor|Foreman|Maintenance Technician|Maintenance Supervisor|Mechanic|Auto Mechanic|Diesel Mechanic|Carpenter|Mason|Safety Officer|HSE Officer|Field Service Engineer|Service Technician|Lineman|Crane Operator|Forklift Operator|Warehouse Supervisor|Driver|Store Keeper|Quality Inspector|ITI Technician',
    creative: 'Graphic Designer|Senior Graphic Designer|UI Designer|UX Designer|UI/UX Designer|Product Designer|Visual Designer|Brand Designer|Motion Designer|Art Director|Creative Director|Illustrator|Interior Designer|Fashion Designer|Textile Designer|Packaging Designer|Web Designer|3D Artist|Architect|Design Lead',
    art: 'Artist|Painter|Visual Artist|Fine Artist|Resin Artist|Textile Artist|Fabric Painter|Illustrator|Muralist|Sculptor|Ceramic Artist|Potter|Photographer|Wedding Photographer|Wildlife Photographer|Product Photographer|Fashion Photographer|Photojournalist|Tattoo Artist|Calligrapher|Art Teacher|Art Instructor|Craft Artist|Mehendi Artist|Makeup Artist',
    film: 'Video Editor|Film Editor|Videographer|Cinematographer|Director|Assistant Director|Producer|Line Producer|Actor|Voice-over Artist|Music Producer|Sound Designer|Sound Engineer|Composer|Singer|Musician|Dancer|Choreographer|Colourist|VFX Artist|Animator|Scriptwriter|Casting Director|Content Creator|YouTuber|Anchor|Theatre Artist',
    writing: 'Content Writer|Senior Content Writer|Copywriter|Technical Writer|Editor|Sub-Editor|Journalist|Reporter|Correspondent|Content Strategist|Proofreader|Communications Manager|Corporate Communications Executive|UX Writer|Grant Writer|Translator|Author|Blogger|Instructional Designer|Public Relations Manager',
    healthcare: 'Staff Nurse|Registered Nurse|Nursing Supervisor|Doctor|Medical Officer|Resident Doctor|Consultant Physician|Surgeon|Dentist|Physiotherapist|Pharmacist|Clinical Pharmacist|Medical Representative|Lab Technician|Medical Lab Technologist|Radiographer|Dietitian|Nutritionist|Clinical Research Associate (CRA)|Clinical Research Coordinator|Hospital Administrator|Medical Coder|Psychologist|Counsellor|Occupational Therapist|Optometrist|Paramedic|Healthcare Manager|Public Health Specialist|Veterinarian|Ayurvedic Doctor',
    teaching: 'Teacher|Primary Teacher (PRT)|Trained Graduate Teacher (TGT)|Post Graduate Teacher (PGT)|Mathematics Teacher|Science Teacher|English Teacher|Computer Teacher|Hindi Teacher|Special Educator|Early Childhood Educator|Montessori Teacher|Principal|Vice Principal|Headmaster|Academic Coordinator|Tutor|Online Tutor|Trainer|Corporate Trainer|Education Counsellor|Curriculum Developer|Librarian|Civil Servant|Government Officer|NGO Programme Manager|Social Worker',
    academia: 'Research Assistant|Research Associate|Research Scholar|PhD Scholar|Junior Research Fellow (JRF)|Senior Research Fellow (SRF)|Postdoctoral Researcher|Assistant Professor|Associate Professor|Professor|Lecturer|Guest Faculty|Visiting Faculty|Teaching Assistant|Lab Manager|Principal Investigator|Scientist|Research Scientist|Project Scientist|Head of Department (HOD)'
  };

  var SKILLS = {
    all: 'Communication|Teamwork|Leadership|Time Management|Problem Solving|Critical Thinking|Customer Service|MS Office|Microsoft Word|Microsoft Excel|Advanced Excel|Microsoft PowerPoint|Google Workspace|Presentation Skills|Public Speaking|Negotiation|Multitasking|Attention to Detail|Typing|ChatGPT|Generative AI tools',
    finance: 'Tally Prime|Tally ERP 9|SAP FICO|SAP S/4HANA|Oracle Financials|QuickBooks|Zoho Books|VLOOKUP|XLOOKUP|Pivot Tables|Power Query|Financial Modelling|Financial Analysis|Financial Reporting|Budgeting|Forecasting|Variance Analysis|MIS Reporting|GST|TDS|Income Tax|Direct Taxation|Indirect Taxation|IFRS|Ind AS|US GAAP|Accounts Payable|Accounts Receivable|Bank Reconciliation|General Ledger|Month-end Close|Statutory Audit|Internal Audit|Payroll|Valuation|DCF Valuation|Mergers & Acquisitions (M&A)|Due Diligence|Credit Analysis|Risk Management|Treasury|Bloomberg Terminal|Capital IQ|Equity Research|Portfolio Management|KYC|AML|Cost Accounting|Working Capital Management',
    sales: 'Salesforce|Salesforce CRM|Salesforce Sales Cloud|HubSpot|Zoho CRM|Microsoft Dynamics 365|LeadSquared|B2B Sales|B2C Sales|SaaS Sales|Lead Generation|Cold Calling|Negotiation|Key Account Management|Pipeline Management|Sales Forecasting|Channel Sales|Business Development|Customer Relationship Management (CRM)|Market Research|Digital Marketing|SEO|SEM|Google Ads|Meta Ads|Google Analytics 4 (GA4)|Social Media Marketing|Content Marketing|Email Marketing|Mailchimp|Performance Marketing|Brand Management|Marketing Automation|Canva|E-commerce|Amazon Seller Central|Shopify|Public Relations|Go-to-Market Strategy',
    law: 'Legal Research|Legal Drafting|Contract Drafting|Contract Negotiation|Due Diligence|Corporate Law|Mergers & Acquisitions (M&A)|Litigation|Arbitration|Intellectual Property|Trademark Filing|Companies Act 2013|SEBI Regulations|FEMA|Labour Law|Consumer Protection|Data Privacy (DPDP Act)|GDPR|Regulatory Compliance|Company Secretarial|Board Meetings|Manupatra|SCC Online|Westlaw|LexisNexis|Legal Opinions|Moot Court',
    consulting: 'Stakeholder Management|Project Management|Program Management|Agile|Scrum|Jira|Confluence|Business Analysis|Requirements Gathering|Process Improvement|Lean|Six Sigma|Change Management|Strategy|Market Sizing|Financial Modelling|PowerPoint Storytelling|Supply Chain Management|Procurement|Vendor Management|Inventory Management|Logistics|SAP MM|SAP SD|Operations Management|KPI Design|Product Management|Product Roadmapping|User Research|Recruitment|Onboarding|HRMS|Workday|SAP SuccessFactors|Performance Management|Employee Engagement|Payroll Management',
    engineering: 'Java|Python|JavaScript|TypeScript|C|C++|C#|Go|Rust|Kotlin|Swift|PHP|Ruby|SQL|HTML|CSS|React|Angular|Vue.js|Next.js|Node.js|Express.js|Spring Boot|Django|Flask|FastAPI|.NET|ASP.NET Core|REST APIs|GraphQL|Microservices|System Design|Data Structures and Algorithms (DSA)|Object-Oriented Programming (OOP)|Git|GitHub|GitLab|Docker|Kubernetes|Terraform|Ansible|Jenkins|GitHub Actions|CI/CD|AWS|Microsoft Azure|Google Cloud (GCP)|Linux|Bash|MySQL|PostgreSQL|MongoDB|Redis|Kafka|RabbitMQ|Elasticsearch|Selenium|Cypress|JUnit|Jest|Android Studio|Flutter|React Native|Salesforce Apex|Salesforce Lightning|SAP ABAP|Cybersecurity|Networking|AutoCAD|SolidWorks|CATIA|Creo|ANSYS|MATLAB|Revit|STAAD Pro|ETABS|Primavera P6|MS Project|GD&T|PLC Programming|SCADA|Embedded C|Arduino|Raspberry Pi|PCB Design|Quality Control|Lean Manufacturing',
    data: 'Python|R|SQL|Pandas|NumPy|Scikit-learn|TensorFlow|PyTorch|Keras|Machine Learning|Deep Learning|Natural Language Processing (NLP)|Computer Vision|Large Language Models (LLMs)|Generative AI|LangChain|Hugging Face|Statistics|A/B Testing|Hypothesis Testing|Regression|Time Series Forecasting|Data Visualisation|Power BI|Tableau|Looker|Looker Studio|DAX|Power Query|Apache Spark|PySpark|Hadoop|Airflow|dbt|Snowflake|BigQuery|Amazon Redshift|Databricks|ETL|Data Warehousing|Data Modelling|MLOps|MLflow|Jupyter|SAS|SPSS|Alteryx',
    trades: 'Electrical Wiring|Industrial Wiring|Panel Wiring|Motor Rewinding|PLC Troubleshooting|Preventive Maintenance|Breakdown Maintenance|HVAC Installation|Chiller Maintenance|VRF Systems|Refrigeration|Plumbing|Pipe Fitting|Arc Welding|MIG Welding|TIG Welding|Gas Cutting|CNC Programming|Lathe Operation|Blueprint Reading|Hand Tools|Power Tools|Safety Compliance|Lockout/Tagout (LOTO)|Work at Height|First Aid|Forklift Operation|Inventory Control|Team Supervision|Site Management|Quality Inspection|Carpentry|Masonry|Solar Panel Installation|Two-wheeler Repair|Four-wheeler Repair',
    creative: 'Figma|Adobe XD|Sketch|Adobe Photoshop|Adobe Illustrator|Adobe InDesign|Adobe After Effects|Adobe Premiere Pro|CorelDRAW|Canva|Blender|Cinema 4D|Autodesk Maya|SketchUp|AutoCAD|3ds Max|V-Ray|Procreate|Framer|Webflow|UI Design|UX Design|User Research|Wireframing|Prototyping|Design Systems|Interaction Design|Usability Testing|Information Architecture|Typography|Branding|Visual Identity|Packaging Design|Illustration|Motion Graphics|Art Direction|Photography|Colour Theory|Accessibility (WCAG)',
    art: 'Acrylic Painting|Oil Painting|Watercolour|Gouache|Charcoal|Pencil Sketching|Portraiture|Landscape Painting|Abstract Art|Palette Knife|Mixed Media|Resin Art|Ocean Resin Art|Geode Art|Alcohol Ink|Fluid Art|River Tables|Fabric Painting|Block Printing|Kalamkari|Madhubani|Warli|Pichwai|Gond Art|Embroidery|Calligraphy|Mural Painting|Pottery|Ceramics|Sculpture|Digital Illustration|Procreate|Adobe Photoshop|Adobe Lightroom|Capture One|Wildlife Photography|Wedding Photography|Portrait Photography|Product Photography|Street Photography|Astrophotography|Drone Photography|Photo Editing|Colour Grading|Framing|Art Commissions|Art Workshops|Art Exhibitions|Instagram Marketing|Etsy',
    film: 'Adobe Premiere Pro|Final Cut Pro|DaVinci Resolve|Avid Media Composer|Adobe After Effects|Colour Grading|Video Editing|Cinematography|Camera Operation|Lighting|Storyboarding|Screenwriting|Direction|Production Management|Budgeting|Scheduling|Ableton Live|FL Studio|Logic Pro|Pro Tools|Cubase|Mixing|Mastering|Sound Design|Foley|Music Composition|Music Production|Voice-over|Acting|Dance|Choreography|Nuke|Houdini|Autodesk Maya|Blender|2D Animation|3D Animation|YouTube|Instagram Reels',
    writing: 'Content Writing|Copywriting|SEO Writing|Technical Writing|Editing|Proofreading|Fact-checking|Research|Interviewing|News Writing|Feature Writing|Long-form Writing|Scriptwriting|UX Writing|Content Strategy|Blogging|Social Media Writing|Email Copywriting|WordPress|Google Docs|Grammarly|Surfer SEO|SEMrush|Ahrefs|AP Style|Chicago Manual of Style|Hindi–English Translation|Ghostwriting|Press Releases|Newsletter Writing|CMS',
    healthcare: 'Patient Care|Clinical Assessment|Medication Administration|IV Cannulation|Wound Care|Vital Signs Monitoring|ICU Care|Emergency Care|Infection Control|Basic Life Support (BLS)|Advanced Cardiac Life Support (ACLS)|Patient Counselling|Electronic Health Records (EHR)|HIMS|Medical Coding|ICD-10|CPT Coding|Pharmacovigilance|Clinical Trials|Good Clinical Practice (GCP)|Drug Dispensing|Laboratory Testing|Phlebotomy|Radiology|Physiotherapy|Manual Therapy|Diet Planning|Nutrition Counselling|Hospital Administration|NABH Standards|Public Health|Epidemiology|Mental Health Counselling|Cognitive Behavioural Therapy (CBT)',
    teaching: 'Lesson Planning|Classroom Management|Curriculum Development|CBSE Curriculum|ICSE Curriculum|IB Curriculum|IGCSE|State Board|Student Assessment|Differentiated Instruction|Activity-based Learning|Experiential Learning|STEM Education|Special Education|Inclusive Education|Parent Communication|Online Teaching|Google Classroom|Microsoft Teams|Zoom|Smart Boards|Mentoring|Student Counselling|Exam Preparation|JEE Coaching|NEET Coaching|Spoken English|Event Management',
    academia: 'Research Design|Literature Review|Grant Writing|Academic Writing|Scientific Writing|Peer Review|Data Analysis|Statistical Analysis|SPSS|R|Python|MATLAB|LaTeX|Zotero|Mendeley|EndNote|Qualitative Research|Quantitative Research|Survey Design|NVivo|Laboratory Techniques|PCR|Cell Culture|Western Blot|Spectroscopy|HPLC|Microscopy|Curriculum Design|Student Supervision|Conference Presentations|Scopus|Web of Science'
  };

  var EDUCATION = {
    all: '10th (SSC)|10th (CBSE)|10th (ICSE)|12th (HSC)|12th (CBSE)|12th (ISC)|Diploma|Polytechnic Diploma|ITI Certificate|B.A.|B.Sc|B.Com|BBA|BMS|BCA|B.Voc|M.A.|M.Sc|M.Com|MBA|PGDM|Executive MBA|MCA|M.Phil|PhD|Postgraduate Diploma|Bachelor of Arts|Bachelor of Science|Bachelor of Commerce|Master of Arts|Master of Science|Distance Learning (IGNOU)|IGNOU|University of Delhi (DU)|University of Mumbai|Savitribai Phule Pune University|Anna University|Osmania University|University of Calcutta|Jadavpur University|Banaras Hindu University (BHU)|Aligarh Muslim University (AMU)|Jawaharlal Nehru University (JNU)|Jamia Millia Islamia|Christ University|Symbiosis International University|Amity University|Manipal Academy of Higher Education|VIT Vellore|SRM Institute of Science and Technology|Lovely Professional University (LPU)|Chandigarh University|Mumbai University|Gujarat University|Rajasthan University|Calicut University|Kerala University|Bangalore University|Visvesvaraya Technological University (VTU)|AKTU|Andhra University|NMIMS|Narsee Monjee College|St. Xavier\'s College|Loyola College|Presidency College|Lady Shri Ram College (LSR)|Shri Ram College of Commerce (SRCC)|St. Stephen\'s College|Hindu College|Miranda House|Fergusson College',
    finance: 'CA (Chartered Accountant)|CA Inter|CA Foundation|CMA (Cost and Management Accountant)|CS (Company Secretary)|CFA|ACCA|CPA|FRM|B.Com (Hons)|M.Com|BBA Finance|MBA Finance|PGDM Finance|ICAI|ICSI|ICMAI',
    sales: 'MBA Marketing|PGDM Marketing|BBA Marketing|BMS|Mass Media (BMM)|Digital Marketing Certificate',
    law: 'LLB|BA LLB|BBA LLB|B.Com LLB|LLM|National Law School of India University (NLSIU)|NALSAR|National Law University Delhi (NLU Delhi)|NLU Jodhpur|WBNUJS|GNLU|Faculty of Law, University of Delhi|ILS Law College|Government Law College Mumbai|Symbiosis Law School|Jindal Global Law School|CS (Company Secretary)',
    consulting: 'MBA|PGDM|PGP|IIM Ahmedabad|IIM Bangalore|IIM Calcutta|IIM Lucknow|IIM Kozhikode|IIM Indore|ISB Hyderabad|XLRI Jamshedpur|FMS Delhi|SPJIMR|MDI Gurgaon|IIFT|JBIMS|NITIE (IIM Mumbai)|MBA HR|MBA Operations',
    engineering: 'B.Tech|B.E.|M.Tech|M.E.|Diploma in Engineering|B.Tech Computer Science|B.Tech Information Technology|B.Tech Electronics and Communication|B.Tech Electrical|B.Tech Mechanical|B.Tech Civil|B.Tech Chemical|B.E. Computer Engineering|MCA|BCA|B.Sc Computer Science|IIT Bombay|IIT Delhi|IIT Madras|IIT Kanpur|IIT Kharagpur|IIT Roorkee|IIT Guwahati|IIT Hyderabad|IIT (BHU) Varanasi|IIIT Hyderabad|IIIT Bangalore|IIIT Allahabad|NIT Trichy|NIT Surathkal|NIT Warangal|NIT Calicut|NIT Rourkela|BITS Pilani|Delhi Technological University (DTU)|NSUT|COEP Technological University|VJTI Mumbai|PSG College of Technology|College of Engineering Guindy|Jadavpur University|IISc Bangalore',
    data: 'B.Tech|B.E.|M.Tech|B.Sc Statistics|M.Sc Statistics|B.Sc Mathematics|M.Sc Mathematics|M.Sc Data Science|B.Sc Data Science|PG Diploma in Data Science|Indian Statistical Institute (ISI)|Chennai Mathematical Institute (CMI)|IIT Madras BS in Data Science|MCA|BCA',
    trades: 'ITI Electrician|ITI Fitter|ITI Welder|ITI Plumber|ITI Mechanic Motor Vehicle|ITI Machinist|ITI Refrigeration and Air Conditioning|ITI Electronics Mechanic|Diploma in Electrical Engineering|Diploma in Mechanical Engineering|Diploma in Civil Engineering|NCVT Certificate|SCVT Certificate|Apprenticeship Certificate',
    creative: 'B.Des|M.Des|B.Arch|M.Arch|BFA|MFA|Diploma in Graphic Design|Diploma in Interior Design|Diploma in Fashion Design|NID Ahmedabad|NID Bengaluru|NIFT|IDC IIT Bombay|MIT Institute of Design|Srishti Manipal Institute|Pearl Academy|Symbiosis Institute of Design|Arena Animation|MAAC',
    art: 'BFA|MFA|BFA Painting|BFA Applied Art|BFA Sculpture|Diploma in Fine Arts|Diploma in Photography|Sir J.J. School of Art|Government College of Fine Arts, Chennai|Faculty of Fine Arts, M.S. University Baroda|Kala Bhavana, Visva-Bharati|College of Art, Delhi|Jamia Millia Islamia (Fine Arts)|Light and Life Academy|NIFT|NID',
    film: 'Diploma in Film Making|FTII Pune|SRFTI Kolkata|Whistling Woods International|Diploma in Sound Engineering|Diploma in Video Editing|BA Mass Communication|BMM|Diploma in Acting|Bharatanatyam Visharad|Kathak Visharad|Trinity College London (Music)|ABRSM (Music)',
    writing: 'BA English|MA English|BA Journalism|BA Mass Communication|MA Mass Communication|BJMC|MJMC|PG Diploma in Journalism|IIMC Delhi|Asian College of Journalism|Symbiosis Institute of Media and Communication|Xavier Institute of Communications',
    healthcare: 'MBBS|MD|MS|DNB|BDS|MDS|BAMS|BHMS|BUMS|B.Sc Nursing|M.Sc Nursing|GNM|ANM|B.Pharm|M.Pharm|Pharm.D|D.Pharm|BPT|MPT|B.Sc MLT|DMLT|B.Sc Radiology|BOT|MPH|B.Sc Nutrition|AIIMS New Delhi|PGIMER Chandigarh|CMC Vellore|JIPMER|AFMC Pune|KEM Hospital|Maulana Azad Medical College|Grant Medical College|Kasturba Medical College',
    teaching: 'B.Ed|M.Ed|D.El.Ed|NTT (Nursery Teacher Training)|Montessori Teacher Training|CTET|TET|B.P.Ed|M.P.Ed|B.Ed Special Education|TEFL|CELTA|Diploma in Early Childhood Education',
    academia: 'PhD|M.Phil|M.Sc|M.Tech|M.A.|Post-doctoral Fellowship|UGC NET|CSIR NET|UGC NET JRF|GATE|IISc Bangalore|TIFR|IISER Pune|IISER Kolkata|NCBS Bangalore|JNU|University of Hyderabad|Pondicherry University'
  };

  var CERTS = {
    all: 'Google Project Management Certificate|Microsoft Office Specialist (MOS)|Six Sigma Green Belt|Six Sigma Black Belt|Six Sigma Yellow Belt|PMP|PRINCE2 Foundation|ITIL 4 Foundation|Certified ScrumMaster (CSM)|Professional Scrum Master (PSM I)|SAFe Agilist|NPTEL Certificate|Coursera Certificate|IELTS|TOEFL|PTE Academic|Duolingo English Test',
    finance: 'CFA Level I|CFA Level II|CFA Level III|FRM Part I|FRM Part II|NISM Series V-A (Mutual Fund Distributors)|NISM Series VIII (Equity Derivatives)|NISM Series XV (Research Analyst)|NCFM|CAIIB|JAIIB|IRDAI Licence|US CMA|ACCA|CPA (US)|Financial Modelling and Valuation Analyst (FMVA)|SAP FICO Certification|Tally Certification|GST Practitioner',
    sales: 'Salesforce Certified Administrator|Salesforce Sales Cloud Consultant|HubSpot Inbound Marketing|HubSpot Sales Software|HubSpot Content Marketing|Google Ads Search Certification|Google Ads Display Certification|Google Analytics Certification (GA4)|Meta Certified Digital Marketing Associate|Meta Blueprint|SEMrush SEO Certification|Amazon Advertising Certification',
    law: 'Company Secretary (CS)|Certified Information Privacy Professional (CIPP/E)|Certified Compliance and Ethics Professional|Diploma in Cyber Law|Diploma in Intellectual Property Rights|Mediation Training Certificate',
    consulting: 'PMP|CAPM|Certified Business Analysis Professional (CBAP)|ECBA|Lean Six Sigma Green Belt|APICS CSCP|CIPS|SHRM-CP|SHRM-SCP|CIPD Level 5|Product Management Certificate',
    engineering: 'AWS Certified Cloud Practitioner|AWS Certified Solutions Architect – Associate|AWS Certified Developer – Associate|AWS Certified SysOps Administrator|Microsoft Azure Fundamentals (AZ-900)|Microsoft Azure Administrator (AZ-104)|Azure Developer Associate (AZ-204)|Google Cloud Associate Cloud Engineer|Google Cloud Professional Cloud Architect|Certified Kubernetes Administrator (CKA)|Certified Kubernetes Application Developer (CKAD)|HashiCorp Terraform Associate|Oracle Certified Java Programmer|Red Hat Certified System Administrator (RHCSA)|Cisco CCNA|CompTIA Security+|Certified Ethical Hacker (CEH)|CISSP|ISTQB Foundation|Salesforce Platform Developer I|Salesforce Platform Developer II|Autodesk Certified Professional: AutoCAD|SolidWorks CSWA|SolidWorks CSWP|GATE',
    data: 'Google Data Analytics Certificate|Microsoft Power BI Data Analyst (PL-300)|Tableau Desktop Specialist|Tableau Certified Data Analyst|IBM Data Science Professional Certificate|AWS Certified Machine Learning – Specialty|Google Cloud Professional Data Engineer|Databricks Certified Data Engineer Associate|Snowflake SnowPro Core|TensorFlow Developer Certificate|Microsoft Azure AI Fundamentals (AI-900)|Azure Data Scientist Associate (DP-100)|DeepLearning.AI Specialization',
    trades: 'Electrical Supervisor Licence|Wireman Licence|Electrical Contractor Licence|NEBOSH IGC|IOSH Managing Safely|OSHA 30-Hour|First Aid Certificate|Fire Safety Certificate|AWS Certified Welder|Forklift Operator Licence|Heavy Vehicle Driving Licence|Refrigerant Handling Certificate|Solar PV Installer Certificate|NSDC Certificate|Apprenticeship (NAPS)',
    creative: 'Google UX Design Certificate|Adobe Certified Professional|Interaction Design Foundation Certificate|Autodesk Certified Professional|NN/g UX Certification|Webflow Certification',
    art: 'Lalit Kala Akademi Scholarship|Diploma in Fine Arts|Adobe Certified Professional: Photoshop|Resin Art Workshop Certificate|Drone Pilot Certificate (DGCA)',
    film: 'Avid Certified User|Apple Final Cut Pro Certification|DaVinci Resolve Certified User|Adobe Certified Professional: Premiere Pro|Pro Tools Certification|Ableton Certified Trainer|Trinity College London Grade Exam',
    writing: 'Google Digital Garage Certificate|HubSpot Content Marketing|Copyblogger Certification|Technical Writing Certificate|Diploma in Journalism',
    healthcare: 'Basic Life Support (BLS)|Advanced Cardiac Life Support (ACLS)|Pediatric Advanced Life Support (PALS)|Neonatal Resuscitation Program (NRP)|ICU Nursing Certificate|Good Clinical Practice (GCP)|Certified Professional Coder (CPC)|NCLEX-RN|OET|Registered with State Nursing Council|Registered with State Medical Council|Registered with State Pharmacy Council|NEET-PG|FMGE|USMLE Step 1|PLAB 1',
    teaching: 'CTET|State TET|HTET|UPTET|CELTA|TEFL|TESOL|Cambridge Teaching Knowledge Test (TKT)|Google Certified Educator Level 1|Microsoft Innovative Educator|Montessori Certification|UGC NET',
    academia: 'UGC NET|UGC NET JRF|CSIR NET JRF|GATE|SET|DST INSPIRE Fellowship|Research Methodology Course|Good Laboratory Practice (GLP)|Biosafety Training'
  };

  var CITIES = 'Mumbai, India|Pune, India|Delhi, India|New Delhi, India|Noida, India|Gurugram, India|Ghaziabad, India|Faridabad, India|Bengaluru, India|Hyderabad, India|Chennai, India|Kolkata, India|Ahmedabad, India|Surat, India|Vadodara, India|Rajkot, India|Jaipur, India|Jodhpur, India|Udaipur, India|Kota, India|Lucknow, India|Kanpur, India|Varanasi, India|Prayagraj, India|Agra, India|Meerut, India|Dehradun, India|Haridwar, India|Chandigarh, India|Mohali, India|Ludhiana, India|Amritsar, India|Jalandhar, India|Shimla, India|Jammu, India|Srinagar, India|Indore, India|Bhopal, India|Gwalior, India|Jabalpur, India|Raipur, India|Bilaspur, India|Nagpur, India|Nashik, India|Aurangabad, India|Kolhapur, India|Solapur, India|Thane, India|Navi Mumbai, India|Goa, India|Panaji, India|Mangaluru, India|Mysuru, India|Hubballi, India|Belagavi, India|Coimbatore, India|Madurai, India|Tiruchirappalli, India|Salem, India|Vellore, India|Puducherry, India|Kochi, India|Thiruvananthapuram, India|Kozhikode, India|Thrissur, India|Visakhapatnam, India|Vijayawada, India|Guntur, India|Tirupati, India|Warangal, India|Bhubaneswar, India|Cuttack, India|Patna, India|Gaya, India|Ranchi, India|Jamshedpur, India|Dhanbad, India|Guwahati, India|Shillong, India|Siliguri, India|Durgapur, India|Allahabad, India|Bareilly, India|Aligarh, India|Gorakhpur, India|Ajmer, India|Bikaner, India|Hisar, India|Panipat, India|Karnal, India|Rohtak, India|Sonipat, India|Anand, India|Gandhinagar, India|Bhavnagar, India|Jamnagar, India|Dubai, UAE|Abu Dhabi, UAE|Sharjah, UAE|Doha, Qatar|Riyadh, Saudi Arabia|Jeddah, Saudi Arabia|Muscat, Oman|Kuwait City, Kuwait|Manama, Bahrain|Singapore|Kuala Lumpur, Malaysia|London, UK|Manchester, UK|Birmingham, UK|Dublin, Ireland|Berlin, Germany|Munich, Germany|Frankfurt, Germany|Amsterdam, Netherlands|Paris, France|Toronto, Canada|Vancouver, Canada|Calgary, Canada|New York, USA|San Francisco, USA|Seattle, USA|Austin, USA|Dallas, USA|Chicago, USA|Boston, USA|Sydney, Australia|Melbourne, Australia|Brisbane, Australia|Auckland, New Zealand|Tokyo, Japan|Remote';

  var EMPLOYERS = 'Tata Consultancy Services (TCS)|Infosys|Wipro|HCLTech|Tech Mahindra|Accenture|Cognizant|Capgemini|IBM|LTIMindtree|Mphasis|Persistent Systems|Hexaware|Coforge|Zensar|Deloitte|PwC|EY|KPMG|Grant Thornton|BDO|McKinsey & Company|Boston Consulting Group (BCG)|Bain & Company|ZS Associates|Genpact|WNS|EXL|Concentrix|Teleperformance|Amazon|Google|Microsoft|Apple|Meta|Oracle|SAP|Salesforce|Adobe|Intel|Qualcomm|Cisco|Nvidia|Texas Instruments|Walmart Global Tech|Flipkart|Myntra|Swiggy|Zomato|Blinkit|Zepto|Paytm|PhonePe|Razorpay|CRED|Zerodha|Groww|Freshworks|Zoho|Ola|Uber|Meesho|Nykaa|Delhivery|BYJU\'S|Unacademy|PhysicsWallah|upGrad|Reliance Industries|Reliance Jio|Bharti Airtel|Vodafone Idea|Tata Motors|Tata Steel|Tata Power|Mahindra & Mahindra|Larsen & Toubro (L&T)|Adani Group|JSW Steel|Vedanta|Aditya Birla Group|Godrej|Bajaj Auto|Hero MotoCorp|Maruti Suzuki|Hyundai India|Ashok Leyland|Siemens|Bosch|ABB|Schneider Electric|Honeywell|GE|Samsung|LG Electronics|Hindustan Unilever (HUL)|ITC|Nestlé India|Procter & Gamble (P&G)|Asian Paints|Dabur|Marico|Britannia|Pidilite|HDFC Bank|ICICI Bank|State Bank of India (SBI)|Axis Bank|Kotak Mahindra Bank|IndusInd Bank|Yes Bank|Bank of Baroda|Punjab National Bank|Bajaj Finance|HDFC Life|ICICI Prudential|LIC|SBI Life|Goldman Sachs|JPMorgan Chase|Morgan Stanley|Barclays|HSBC|Citi|Standard Chartered|Deutsche Bank|American Express|Wells Fargo|BNY|UBS|BlackRock|Apollo Hospitals|Fortis Healthcare|Max Healthcare|Manipal Hospitals|Narayana Health|Medanta|AIIMS|Sun Pharma|Cipla|Dr. Reddy\'s|Lupin|Biocon|Zydus|Ogilvy|Dentsu|WPP|Publicis|Leo Burnett|The Times of India|Hindustan Times|NDTV|India Today|The Hindu|Netflix|Yash Raj Films|T-Series|ONGC|NTPC|BHEL|Indian Oil (IOCL)|GAIL|ISRO|DRDO|Indian Railways|Kendriya Vidyalaya|Delhi Public School (DPS)|DMart|Big Bazaar|Croma|Tanishq|Titan|Self-employed|Freelance';

  var LANGUAGES = 'English|Hindi|Marathi|Gujarati|Bengali|Tamil|Telugu|Kannada|Malayalam|Punjabi|Odia|Assamese|Urdu|Konkani|Sindhi|Kashmiri|Nepali|Maithili|Bhojpuri|Rajasthani|Garhwali|Tulu|Sanskrit|French|German|Spanish|Japanese|Mandarin Chinese|Korean|Arabic|Russian|Italian|Portuguese|Dutch';
  var LEVELS = ' (native)| (fluent)| (professional)| (conversational)| (basic)';

  // ---- build the entries: [label, words, normalised label, field] -----------
  var norm = function (s) { return String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9+#]/g, ''); };
  var entries = function (text, field) {
    return String(text).split('|').filter(Boolean).map(function (label, i) {
      return { i: i, label: label, low: label.toLowerCase(), n: norm(label), words: label.toLowerCase().split(/[^a-z0-9+#]+/).filter(Boolean), f: field };
    });
  };
  var byField = function (obj) {
    var out = [], seen = {};
    Object.keys(obj).forEach(function (k) {
      entries(obj[k], k === 'all' ? '' : k).forEach(function (e) {
        if (seen[e.low] !== undefined) { if (e.f) out[seen[e.low]].also = (out[seen[e.low]].also || []).concat(e.f); return; }
        seen[e.low] = out.length; out.push(e);
      });
    });
    return out;
  };
  var SRC = {};
  var lazy = function (key) {
    if (SRC[key]) return SRC[key];
    if (key === 'titles') SRC[key] = byField(TITLES);
    else if (key === 'skills') SRC[key] = byField(SKILLS);
    else if (key === 'education') SRC[key] = byField(EDUCATION);
    else if (key === 'certs') SRC[key] = byField(CERTS);
    else if (key === 'cities') SRC[key] = entries(CITIES, '');
    else if (key === 'employers') SRC[key] = entries(EMPLOYERS, '');
    else if (key === 'languages') SRC[key] = entries(LANGUAGES, '');
    else if (key === 'roles') SRC[key] = lazy('titles').concat(lazy('employers'));
    return SRC[key];
  };

  // which boxes get which list; multi = several values separated by commas
  var WIRES = [
    ['#currentRole', 'titles', false], ['#employer', 'employers', false],
    ['#location', 'cities', false], ['#p-city', 'cities', false],
    ['#target', 'roles', true], ['#skills', 'skills', true], ['#p-skills', 'skills', true],
    ['#certs', 'certs', true], ['#education', 'education', true],
    ['#languages', 'languages', true], ['[name="projRole"]', 'titles', false]
  ];
  var wireFor = function (el) {
    for (var i = 0; i < WIRES.length; i++) if (el.matches && el.matches(WIRES[i][0])) return WIRES[i];
    return null;
  };

  var fieldOf = function (el) {
    var sel = el.form && el.form.elements.field;
    return sel && sel.tagName === 'SELECT' ? (FIELDS[sel.selectedIndex] || '') : '';
  };

  // the part being typed: whole value, or the text after the last separator before the caret
  var tokenOf = function (el, multi) {
    var pos = el.selectionStart == null ? el.value.length : el.selectionStart;
    var before = el.value.slice(0, pos);
    if (!multi) return { start: 0, end: el.value.length, text: el.value.trim() };
    var cut = Math.max(before.lastIndexOf(','), before.lastIndexOf('\n'), before.lastIndexOf(';'));
    var raw = before.slice(cut + 1);
    var lead = raw.length - raw.replace(/^\s+/, '').length;
    return { start: cut + 1 + lead, end: pos, text: raw.trim() };
  };

  var rank = function (list, q, field, taken) {
    var ql = q.toLowerCase(), qn = norm(q), out = [];
    if (qn.length < 2 && ql.length < 2) return out;
    list.forEach(function (e) {
      if (taken[e.low]) return;
      var s = 0;
      if (e.low.indexOf(ql) === 0) s = 100;
      else if (qn && e.n.indexOf(qn) === 0) s = 92;
      else {
        for (var i = 0; i < e.words.length; i++) if (e.words[i].indexOf(ql) === 0) { s = 75 - i; break; }
        if (!s && qn.length >= 4 && e.n.indexOf(qn) > 0) s = 40;
      }
      if (!s) return;
      if (field && (e.f === field || (e.also && e.also.indexOf(field) > -1))) s += 30;
      else if (field && e.f) s -= 8;                         // another field's term: still offered, lower
      s -= e.label.length * 0.005 + e.i * 0.3;                 // shorter, and earlier in its list (the common ones), first
      out.push({ e: e, s: s });
    });
    out.sort(function (a, b) { return b.s - a.s; });
    return out.slice(0, 8).map(function (x) { return x.e; });
  };

  // ---- the list ---------------------------------------------------------------
  var box = null, active = null, items = [], cur = -1, uid = 0;
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var mark = function (label, q) {
    var i = label.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) {
      var m = label.toLowerCase().match(new RegExp('(^|[^a-z0-9])' + q.toLowerCase().replace(/[^a-z0-9]/g, '')));
      if (m) i = m.index + m[1].length; else return esc(label);
    }
    return esc(label.slice(0, i)) + '<b>' + esc(label.slice(i, i + q.length)) + '</b>' + esc(label.slice(i + q.length));
  };
  var ensureBox = function () {
    if (box) return box;
    box = document.createElement('ul');
    box.className = 'ac-list'; box.id = 'ac-list'; box.setAttribute('role', 'listbox'); box.hidden = true;
    box.addEventListener('pointerdown', function (ev) {         // keep focus in the box while picking
      var li = ev.target.closest ? ev.target.closest('li[data-i]') : null;
      if (!li) return;
      ev.preventDefault();
      pick(+li.getAttribute('data-i'));
    });
    document.body.appendChild(box);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    if (window.ResizeObserver) new ResizeObserver(place).observe(document.body);   // content above can shift (e.g. "Draft saved")
    return box;
  };
  var place = function () {
    if (!box || box.hidden || !active) return;
    var r = active.getBoundingClientRect();
    box.style.left = (r.left + window.scrollX) + 'px';
    box.style.top = (r.bottom + window.scrollY + 4) + 'px';
    box.style.width = Math.max(r.width, 220) + 'px';
  };
  var close = function () {
    if (box) box.hidden = true;
    if (active) { active.setAttribute('aria-expanded', 'false'); active.removeAttribute('aria-activedescendant'); }
    items = []; cur = -1;
  };
  var highlight = function (i) {
    cur = i;
    Array.prototype.forEach.call(box.children, function (li, k) {
      li.setAttribute('aria-selected', k === i ? 'true' : 'false');
      if (k === i) { active.setAttribute('aria-activedescendant', li.id); li.scrollIntoView({ block: 'nearest' }); }
    });
  };
  var show = function (el) {
    var w = wireFor(el);
    if (!w) return;
    var tok = tokenOf(el, w[2]);
    var taken = {};
    if (w[2]) el.value.split(/[,\n;]/).forEach(function (t) { t = t.trim().toLowerCase(); if (t && t !== tok.text.toLowerCase()) taken[t] = 1; });
    items = rank(lazy(w[1]), tok.text, fieldOf(el), taken);
    if (!items.length || (items.length === 1 && items[0].low === tok.text.toLowerCase())) { close(); return; }
    ensureBox();
    active = el;
    box.innerHTML = items.map(function (e, i) {
      return '<li role="option" id="ac-' + (uid++) + '" data-i="' + i + '" aria-selected="false">' + mark(e.label, tok.text) + '</li>';
    }).join('');
    box.hidden = false; cur = -1;
    el.setAttribute('aria-expanded', 'true');
    place();
  };
  var pick = function (i) {
    var el = active, w = el && wireFor(el), e = items[i];
    if (!el || !e) return;
    if (!w[2]) {
      el.value = e.label;
      el.setSelectionRange(el.value.length, el.value.length);
    } else {
      var tok = tokenOf(el, true);
      var after = el.value.slice(tok.end).replace(/^[^,\n;]*/, '');
      var sep = el.value.indexOf('\n') > -1 && el.value.indexOf(',') < 0 ? '\n' : ', ';
      var head = el.value.slice(0, tok.start) + e.label;
      el.value = head + (after ? after : sep);
      var at = head.length + (after ? 0 : sep.length);
      el.setSelectionRange(at, at);
    }
    close();
    quiet = true;                                               // our own events: do not reopen the list
    el.dispatchEvent(new Event('input', { bubbles: true }));    // drafts and the summary follow
    el.dispatchEvent(new Event('change', { bubbles: true }));
    quiet = false;
    el.focus();
  };

  var quiet = false;

  // ---- wiring: one set of listeners for every box, including project boxes added later
  var prepare = function (el) {
    if (el._ac) return;
    el._ac = true;
    el.setAttribute('autocomplete', 'off');                     // no second, browser-made list on top of ours
    el.setAttribute('aria-autocomplete', 'list');
    el.setAttribute('aria-controls', 'ac-list');
    el.setAttribute('aria-expanded', 'false');
  };
  document.addEventListener('focusin', function (ev) { if (wireFor(ev.target)) prepare(ev.target); });
  document.addEventListener('input', function (ev) {
    if (quiet) return;
    var el = ev.target;
    if (!wireFor(el)) return;
    prepare(el);
    show(el);
  });
  document.addEventListener('keydown', function (ev) {
    var el = ev.target;
    if (!box || box.hidden || el !== active) return;
    if (ev.key === 'ArrowDown') { ev.preventDefault(); highlight((cur + 1) % items.length); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); highlight((cur - 1 + items.length) % items.length); }
    else if (ev.key === 'Enter' && cur > -1) { ev.preventDefault(); pick(cur); }
    else if (ev.key === 'Tab' && cur > -1) { pick(cur); }
    else if (ev.key === 'Escape') { ev.preventDefault(); close(); }
  });
  document.addEventListener('focusout', function (ev) {
    if (ev.target === active) window.setTimeout(function () { if (document.activeElement !== active) close(); }, 120);
  });
})();
