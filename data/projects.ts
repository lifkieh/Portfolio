import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

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

export async function getProjects(): Promise<Project[]> {
  try {
    if (redis) {
      const data = await redis.get('projects');
      if (data) return data as Project[];
    }
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

export async function getAbout(): Promise<AboutData> {
  try {
    if (redis) {
      const data = await redis.get('about');
      if (data) return data as AboutData;
    }
    const raw = fs.readFileSync(aboutPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { name: '', avatar: '', resumeUrl: '', subtitle: '', bio: '', githubUrl: '', linkedinUrl: '' };
  }
}

export type SkillsToolsData = {
  skills: string[]
  tools: string[]
  frameworks?: string[]
}

const skillsPath = path.join(process.cwd(), 'data', 'skills.json');

export async function getSkillsTools(): Promise<SkillsToolsData> {
  try {
    if (redis) {
      const data = await redis.get('skills');
      if (data) return data as SkillsToolsData;
    }
    const raw = fs.readFileSync(skillsPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { skills: [], tools: [], frameworks: [] };
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

export async function getCertificates(): Promise<Certificate[]> {
  try {
    if (redis) {
      const data = await redis.get('certificates');
      if (data) return data as Certificate[];
    }
    const raw = fs.readFileSync(certificatesPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}