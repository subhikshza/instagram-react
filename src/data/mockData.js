// Mock data layer — swap this out for a real API later

export const currentUser = {
  username: "subhiksha.codes",
  name: "Subhiksha",
  avatar: "https://i.pravatar.cc/150?img=47",
};

export const stories = [
  { id: 1, username: "aditi.k", avatar: "https://i.pravatar.cc/150?img=32", seen: false },
  { id: 2, username: "rahul_dev", avatar: "https://i.pravatar.cc/150?img=12", seen: false },
  { id: 3, username: "meera.codes", avatar: "https://i.pravatar.cc/150?img=45", seen: true },
  { id: 4, username: "kiran.travels", avatar: "https://i.pravatar.cc/150?img=8", seen: false },
  { id: 5, username: "priya_designs", avatar: "https://i.pravatar.cc/150?img=25", seen: false },
  { id: 6, username: "arjun.builds", avatar: "https://i.pravatar.cc/150?img=15", seen: true },
  { id: 7, username: "sara.codes", avatar: "https://i.pravatar.cc/150?img=9", seen: false },
];

export const posts = [
  {
    id: 1,
    username: "kiran.travels",
    avatar: "https://i.pravatar.cc/150?img=8",
    location: "Munnar, Kerala",
    image: "https://picsum.photos/id/1015/600/600",
    caption: "Tea gardens and cloud cover. Worth the 4am start.",
    likes: 482,
    comments: [
      { id: 1, username: "meera.codes", text: "This is stunning 😍" },
      { id: 2, username: "arjun.builds", text: "Adding to my list" },
    ],
    timestamp: "2 HOURS AGO",
    liked: false,
    saved: false,
  },
  {
    id: 2,
    username: "priya_designs",
    avatar: "https://i.pravatar.cc/150?img=25",
    location: "Bangalore, India",
    image: "https://picsum.photos/id/1025/600/600",
    caption: "New portfolio site is finally live. Three weeks, way too many font changes.",
    likes: 913,
    comments: [
      { id: 1, username: "rahul_dev", text: "Clean layout!" },
    ],
    timestamp: "4 HOURS AGO",
    liked: true,
    saved: false,
  },
  {
    id: 3,
    username: "arjun.builds",
    avatar: "https://i.pravatar.cc/150?img=15",
    location: "Chennai, India",
    image: "https://picsum.photos/id/1074/600/600",
    caption: "Weekend hardware project: a Bluetooth-controlled rover.",
    likes: 267,
    comments: [],
    timestamp: "6 HOURS AGO",
    liked: false,
    saved: true,
  },
  {
    id: 4,
    username: "sara.codes",
    avatar: "https://i.pravatar.cc/150?img=9",
    location: "Hyderabad, India",
    image: "https://picsum.photos/id/1035/600/600",
    caption: "Hackathon weekend. Slept 6 hours across 2 days.",
    likes: 601,
    comments: [
      { id: 1, username: "aditi.k", text: "Legend 🔥" },
      { id: 2, username: "kiran.travels", text: "What did you build?" },
    ],
    timestamp: "1 DAY AGO",
    liked: false,
    saved: false,
  },
];

export const suggestions = [
  {
    id: 1,
    username: "devika.ml",
    subtitle: "Followed by rahul_dev",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
  {
    id: 2,
    username: "nikhil.stack",
    subtitle: "New to Instagram",
    avatar: "https://i.pravatar.cc/150?img=51",
  },
  {
    id: 3,
    username: "ananya_ux",
    subtitle: "Followed by priya_designs",
    avatar: "https://i.pravatar.cc/150?img=19",
  },
  {
    id: 4,
    username: "vikram.cloud",
    subtitle: "Followed by arjun.builds",
    avatar: "https://i.pravatar.cc/150?img=60",
  },
  {
    id: 5,
    username: "tanvi.reads",
    subtitle: "New to Instagram",
    avatar: "https://i.pravatar.cc/150?img=41",
  },
];