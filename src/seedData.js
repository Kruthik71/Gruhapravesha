// Seed data is only used the first time a list is created (before anything
// has been saved to its remote store). After that, whatever's in storage wins.

function toPeople(sections) {
  let id = 1;
  const people = [];
  sections.forEach((sec) => {
    sec.people.forEach((name) => {
      people.push({
        id: id++,
        section: sec.title,
        name,
        phone: '',
        extra: 0,
        called: false,
        coming: false,
        arrivedCount: null,
      });
    });
  });
  return { people, sections: sections.map((s) => s.title), nextId: id };
}

export const SEEDS = {
  kruthik: toPeople([
    { title: 'School', people: ['Gunda & Family', 'Moti & Family', 'Sheki & Family', 'Rotta & Family', 'Prajju', 'Meese', 'Partner', 'Bhatta & Family', 'Malli', 'Yashwanth'] },
    { title: 'Thota Friends', people: ['Vinay', 'Charan', 'Chandan', 'Manoj'] },
    { title: 'PU College', people: ['Thotu', 'Vallabh', 'Vivek', 'Kedar', 'Nitesh'] },
    { title: 'AIT', people: ['MD & Family', 'Naresh', 'Inchara', 'Gagana', 'Chiru', 'Bhavana', 'Anirudh & Family', 'Gagan & Family (2 + 3 + 3)', 'Ajay', 'Badri', 'Uma', 'Gagan (Kulla)', 'Patil', 'Preetham', 'Rahul', 'Yasaswini'] },
    { title: 'New Team', people: ['Ashok', 'Shain', 'Kavya', 'Rambabu', 'Umesh', 'Jagadish', 'Varshitha', 'Keerthi', 'Anusha', 'Giri', 'Shanth'] },
    { title: 'Old Team', people: ['Aastha', 'Chandana', 'Supreet', 'Sunil', 'Baljeet', 'Raj', 'Guru', 'Linto', 'Henny', 'Satheesh', 'Raghu', 'Hemanth', 'Vinodh'] },
    { title: 'Seniors', people: ['Nuthan', 'Ritesh', 'Sanjay', 'Nippam', 'Parthu', 'Pradeep', 'Suhas'] },
    { title: 'North Gang', people: ['Akhil', 'Shruthi', 'Yogesh', 'Sparsh', 'Suhas'] },
    { title: 'BE/FE Office', people: ['Pradeep', 'Govind', 'Karthik', 'Sneha', 'Laxman', 'Jeevan', 'Aruna'] },
  ]),

  // Empty starter sections for the brother's list — add people from the UI.
  brother: toPeople([
    { title: 'School Friends', people: [] },
    { title: 'Office Friends', people: [] },
  ]),
};

export function getSeed(slug) {
  return SEEDS[slug] || { people: [], sections: [], nextId: 1 };
}
