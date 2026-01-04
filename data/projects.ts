// src/data/projects.ts

export type Project = {
  id: number
  title: string
  description: string
  img: string
  tech: string[]
  link: string
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Catalog Dua Naga Perkasa",
    description: "Catalog website of PT Dua Naga Perkasa",
    img: "/images/nagaper.jpg",
    tech: ["SQL", "PHP"],
    link: "https://github.com/lifkiss/PT-DuaNagaPerkasa.git"
  },
  { 
    id: 2,
    title: "Galley La Hall",
    description: "3D game",
    img: "/images/galleylahall.jpg",
    tech: ["UNITY 3D", "C#"],
    link: "https://vinnyvv.itch.io/galley-la-halls"
  },
  {
    id: 3,
    title: "Kalimantan Barat",
    description: "About West Borneo",
    img: "/images/indahnya.jpg",
    tech: ["SWIPER", "HTML"],
    link: "https://indahnyakalimantanbarat.vercel.app/"
  },
  {
    id: 4,
    title: "Crimson Down The Creek",
    description: "Visual Novel Game",
    img: "/images/CrimsonD.png",
    tech: ["PYTHON", "RENPY"],
    link: "https://vnjcafeumn.itch.io/crimson-down-the-creek"
  }
]
