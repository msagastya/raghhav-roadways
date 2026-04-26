const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const statesAndCities = [
  {
    stateName: 'Andhra Pradesh',
    stateCode: 'AP',
    cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Kakinada', 'Tirupati', 'Anantapur', 'Kadapa']
  },
  {
    stateName: 'Arunachal Pradesh',
    stateCode: 'AR',
    cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Bomdila', 'Tawang', 'Ziro']
  },
  {
    stateName: 'Assam',
    stateCode: 'AS',
    cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon']
  },
  {
    stateName: 'Bihar',
    stateCode: 'BR',
    cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar']
  },
  {
    stateName: 'Chhattisgarh',
    stateCode: 'CG',
    cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh', 'Jagdalpur']
  },
  {
    stateName: 'Goa',
    stateCode: 'GA',
    cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim']
  },
  {
    stateName: 'Gujarat',
    stateCode: 'GJ',
    cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhidham', 'Nadiad', 'Morbi', 'Anand', 'Bharuch', 'Vapi', 'Navsari', 'Valsad', 'Sachin']
  },
  {
    stateName: 'Haryana',
    stateCode: 'HR',
    cities: ['Faridabad', 'Gurgaon', 'Hisar', 'Rohtak', 'Panipat', 'Karnal', 'Sonipat', 'Yamunanagar', 'Panchkula', 'Ambala']
  },
  {
    stateName: 'Himachal Pradesh',
    stateCode: 'HP',
    cities: ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Kullu', 'Hamirpur', 'Una', 'Bilaspur', 'Chamba']
  },
  {
    stateName: 'Jharkhand',
    stateCode: 'JH',
    cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh']
  },
  {
    stateName: 'Karnataka',
    stateCode: 'KA',
    cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belgaum', 'Davanagere', 'Ballari', 'Vijayapura', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet']
  },
  {
    stateName: 'Kerala',
    stateCode: 'KL',
    cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kasaragod']
  },
  {
    stateName: 'Madhya Pradesh',
    stateCode: 'MP',
    cities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Burhanpur']
  },
  {
    stateName: 'Maharashtra',
    stateCode: 'MH',
    cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded', 'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Ichalkaranji', 'Navi Mumbai', 'Kalyan-Dombivli']
  },
  {
    stateName: 'Manipur',
    stateCode: 'MN',
    cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Ukhrul']
  },
  {
    stateName: 'Meghalaya',
    stateCode: 'ML',
    cities: ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Baghmara']
  },
  {
    stateName: 'Mizoram',
    stateCode: 'MZ',
    cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib']
  },
  {
    stateName: 'Nagaland',
    stateCode: 'NL',
    cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto']
  },
  {
    stateName: 'Odisha',
    stateCode: 'OR',
    cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada']
  },
  {
    stateName: 'Punjab',
    stateCode: 'PB',
    cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur', 'Batala', 'Moga']
  },
  {
    stateName: 'Rajasthan',
    stateCode: 'RJ',
    cities: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar']
  },
  {
    stateName: 'Sikkim',
    stateCode: 'SK',
    cities: ['Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Rangpo']
  },
  {
    stateName: 'Tamil Nadu',
    stateCode: 'TN',
    cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Ranipet', 'Nagercoil', 'Thanjavur', 'Vellore', 'Kancheepuram', 'Erode', 'Tiruvannamalai', 'Pollachi', 'Rajapalayam']
  },
  {
    stateName: 'Telangana',
    stateCode: 'TS',
    cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet']
  },
  {
    stateName: 'Tripura',
    stateCode: 'TR',
    cities: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Ambassa']
  },
  {
    stateName: 'Uttar Pradesh',
    stateCode: 'UP',
    cities: ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Rampur', 'Shahjahanpur', 'Farrukhabad']
  },
  {
    stateName: 'Uttarakhand',
    stateCode: 'UK',
    cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Pithoragarh']
  },
  {
    stateName: 'West Bengal',
    stateCode: 'WB',
    cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Haldia', 'Raiganj']
  },
  {
    stateName: 'Andaman and Nicobar Islands',
    stateCode: 'AN',
    cities: ['Port Blair', 'Diglipur', 'Rangat', 'Car Nicobar']
  },
  {
    stateName: 'Chandigarh',
    stateCode: 'CH',
    cities: ['Chandigarh']
  },
  {
    stateName: 'Dadra and Nagar Haveli and Daman and Diu',
    stateCode: 'DH',
    cities: ['Daman', 'Diu', 'Silvassa']
  },
  {
    stateName: 'Delhi',
    stateCode: 'DL',
    cities: ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Narela', 'Najafgarh', 'Shahdara']
  },
  {
    stateName: 'Jammu and Kashmir',
    stateCode: 'JK',
    cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua', 'Sopore', 'Rajouri']
  },
  {
    stateName: 'Ladakh',
    stateCode: 'LA',
    cities: ['Leh', 'Kargil', 'Nubra']
  },
  {
    stateName: 'Lakshadweep',
    stateCode: 'LD',
    cities: ['Kavaratti', 'Agatti', 'Andrott', 'Minicoy']
  },
  {
    stateName: 'Puducherry',
    stateCode: 'PY',
    cities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam']
  }
];

async function seedStatesCities() {
  console.log('🌱 Starting to seed Indian states and cities...');

  try {
    for (const stateData of statesAndCities) {
      console.log(`\nAdding state: ${stateData.stateName}...`);

      // Create or update state
      const state = await prisma.state.upsert({
        where: { stateName: stateData.stateName },
        update: {
          stateCode: stateData.stateCode
        },
        create: {
          stateName: stateData.stateName,
          stateCode: stateData.stateCode
        }
      });

      // Add cities for this state
      for (const cityName of stateData.cities) {
        await prisma.city.upsert({
          where: {
            cityName_stateId: {
              cityName: cityName,
              stateId: state.id
            }
          },
          update: {},
          create: {
            cityName: cityName,
            stateId: state.id
          }
        });
      }

      console.log(`✅ Added ${stateData.cities.length} cities for ${stateData.stateName}`);
    }

    console.log('\n✨ Successfully seeded all Indian states and cities!');
    console.log(`\n📊 Summary:`);

    const stateCount = await prisma.state.count();
    const cityCount = await prisma.city.count();

    console.log(`- States: ${stateCount}`);
    console.log(`- Cities: ${cityCount}`);

  } catch (error) {
    console.error('❌ Error seeding states and cities:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedStatesCities();
