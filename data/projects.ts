import fs from 'fs';
import path from 'path';

export type Project = {
  id: number
  title: string
  description: string
  longDescription?: string
  img: string
  tech: string[]
  link: string
  github?: string
  documentUrl?: string
}

const filePath = path.join(process.cwd(), 'data', 'projects.json');

export function getProjects(): Project[] {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export type AboutData = {
  name: string
  avatar: string
  resumeUrl: string
  subtitle: string
  bio: string
  githubUrl: string
  linkedinUrl: string
}

const aboutPath = path.join(process.cwd(), 'data', 'about.json');

export function getAbout(): AboutData {
  try {
    const raw = fs.readFileSync(aboutPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { name: '', avatar: '', resumeUrl: '', subtitle: '', bio: '', githubUrl: '', linkedinUrl: '' };
  }
}

export type SkillsToolsData = {
  skills: string[]
  tools: string[]
}

const skillsPath = path.join(process.cwd(), 'data', 'skills.json');

export function getSkillsTools(): SkillsToolsData {
  try {
    const raw = fs.readFileSync(skillsPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { skills: [], tools: [] };
  }
}

export type Certificate = {
  id: number
  title: string
  platform: string
  description: string
  img: string
  date: string
  credentialUrl?: string
}

const certificatesPath = path.join(process.cwd(), 'data', 'certificates.json');

export function getCertificates(): Certificate[] {
  try {
    const raw = fs.readFileSync(certificatesPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}