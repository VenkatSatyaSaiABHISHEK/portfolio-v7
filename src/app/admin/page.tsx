"use client";

import { useEffect, useState } from "react";
import {
  Heading,
  Text,
  Button,
  Avatar,
  Column,
  Row,
  Flex,
  IconButton,
  Spinner,
  useToast,
} from "@once-ui-system/core";
import styles from "./admin.module.scss";

interface SocialLink {
  name: string;
  icon: string;
  link: string;
  essential: boolean;
}

interface WorkExperience {
  company: string;
  timeframe: string;
  role: string;
  achievements: string[];
  images: Array<{
    src: string;
    alt: string;
    width: number;
    height: number;
  }>;
}

interface Institution {
  name: string;
  description: string;
}

interface SkillTag {
  name: string;
  icon: string;
}

interface Skill {
  title: string;
  description: string;
  tags: SkillTag[];
  images: Array<{
    src: string;
    alt: string;
    width: number;
    height: number;
  }>;
}

interface GalleryImage {
  src: string;
  alt: string;
  orientation: "horizontal" | "vertical";
}

interface ProjectMetadata {
  title: string;
  summary: string;
  image: string;
  images: string[];
  tag: string;
  team: Array<{
    name: string;
    role: string;
    avatar: string;
    linkedIn: string;
  }>;
  link: string;
  publishedAt: string;
}

interface CustomProject {
  slug: string;
  content: string;
  metadata: ProjectMetadata;
}

interface PortfolioData {
  person: {
    firstName: string;
    lastName: string;
    name: string;
    role: string;
    avatar: string;
    email: string;
    location: string;
    languages: string[];
    locale: string;
  };
  social: SocialLink[];
  newsletter: {
    display: boolean;
    title: string;
    description: string;
  };
  home: {
    path: string;
    image: string;
    label: string;
    title: string;
    description: string;
    headline: string;
    featured: {
      display: boolean;
      title: string;
      href: string;
    };
    subline: string;
  };
  about: {
    path: string;
    label: string;
    title: string;
    description: string;
    tableOfContent: {
      display: boolean;
      subItems: boolean;
    };
    avatar: {
      display: boolean;
    };
    calendar: {
      display: boolean;
      link: string;
    };
    intro: {
      display: boolean;
      title: string;
      description: string;
    };
    work: {
      display: boolean;
      title: string;
      experiences: WorkExperience[];
    };
    studies: {
      display: boolean;
      title: string;
      institutions: Institution[];
    };
    technical: {
      display: boolean;
      title: string;
      skills: Skill[];
    };
  };
  blog: {
    path: string;
    label: string;
    title: string;
    description: string;
  };
  work: {
    path: string;
    label: string;
    title: string;
    description: string;
  };
  gallery: {
    path: string;
    label: string;
    title: string;
    description: string;
    images: GalleryImage[];
  };
  projects?: CustomProject[];
}

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800",
];

const cleanGoogleDriveUrl = (url: string): string => {
  if (!url) return "";
  let cleaned = url.trim();
  if (cleaned.includes("drive.google.com/file/d/")) {
    const parts = cleaned.split("drive.google.com/file/d/");
    if (parts.length > 1) {
      const fileId = parts[1].split("/")[0];
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  if (cleaned.includes("drive.google.com/open?id=")) {
    const parts = cleaned.split("drive.google.com/open?id=");
    if (parts.length > 1) {
      const fileId = parts[1].split("&")[0];
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  if (cleaned.includes("docs.google.com/file/d/")) {
    const parts = cleaned.split("docs.google.com/file/d/");
    if (parts.length > 1) {
      const fileId = parts[1].split("/")[0];
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  return cleaned;
};

export default function AdminCRM() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [importingPost, setImportingPost] = useState(false);
  const [isFirebase, setIsFirebase] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "profile" | "home" | "experience" | "projects" | "education" | "gallery"
  >("dashboard");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinPostUrl, setLinkedinPostUrl] = useState("");
  
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/portfolio-data");
        if (res.ok) {
          const json = await res.json();
          setData(json);
          const li = json.social.find((s: SocialLink) => s.name.toLowerCase() === "linkedin");
          if (li) {
            setLinkedinUrl(li.link);
          }
        } else {
          addToast({ variant: "danger", message: "Failed to load portfolio data." });
        }

        // Detect if Firebase connection is active by checking env config loaded
        const hasFirebaseKey = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        setIsFirebase(hasFirebaseKey);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        addToast({ variant: "success", message: "Portfolio data saved successfully!" });
      } else {
        const errorJson = await res.json();
        addToast({ variant: "danger", message: errorJson.error || "Failed to save portfolio data." });
      }
    } catch (error) {
      console.error("Error saving data:", error);
      addToast({ variant: "danger", message: "A network error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  const syncLinkedInPhoto = () => {
    if (!data) return;
    if (!linkedinUrl) {
      addToast({ variant: "danger", message: "Please enter a LinkedIn profile URL first." });
      return;
    }

    let username = linkedinUrl.replace(/\/$/, ""); 
    const parts = username.split("/in/");
    if (parts.length > 1) {
      username = parts[1].split("/")[0];
    } else {
      const plainParts = username.split("/");
      username = plainParts[plainParts.length - 1];
    }

    if (!username) {
      addToast({ variant: "danger", message: "Could not extract username from the LinkedIn URL." });
      return;
    }

    const avatarUrl = `https://unavatar.io/linkedin/${username}`;
    setData({
      ...data,
      person: {
        ...data.person,
        avatar: avatarUrl,
      },
    });

    addToast({ variant: "success", message: "LinkedIn photo synced!" });
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    setParsingPdf(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        const updated = { ...data };
        
        if (json.person.name) updated.person.name = json.person.name;
        if (json.person.firstName) updated.person.firstName = json.person.firstName;
        if (json.person.lastName) updated.person.lastName = json.person.lastName;
        if (json.person.email) updated.person.email = json.person.email;
        if (json.person.linkedIn) {
          const liIdx = updated.social.findIndex(s => s.name.toLowerCase() === "linkedin");
          if (liIdx !== -1) {
            updated.social[liIdx].link = json.person.linkedIn;
          }
        }
        
        if (json.skills && json.skills.length > 0) {
          const techSkillIdx = updated.about.technical.skills.findIndex(s => s.title.toLowerCase().includes("skills"));
          if (techSkillIdx !== -1) {
            const currentTags = updated.about.technical.skills[techSkillIdx].tags;
            const newTags = json.skills.map((s: string) => ({ name: s, icon: "code" }));
            updated.about.technical.skills[techSkillIdx].tags = [...newTags, ...currentTags.filter((t: any) => !json.skills.includes(t.name))];
          }
        }
        
        if (json.experiences && json.experiences.length > 0) {
          updated.about.work.experiences = [...json.experiences, ...updated.about.work.experiences];
        }

        setData(updated);
        addToast({ variant: "success", message: "PDF resume parsed and profile fields populated!" });
      } else {
        addToast({ variant: "danger", message: "Failed to parse PDF resume." });
      }
    } catch (err) {
      console.error(err);
      addToast({ variant: "danger", message: "An error occurred during resume import." });
    } finally {
      setParsingPdf(false);
    }
  };

  const handleLinkedInPostImport = async () => {
    if (!data) return;
    if (!linkedinPostUrl) {
      addToast({ variant: "danger", message: "Please enter a LinkedIn post URL first." });
      return;
    }
    
    setImportingPost(true);
    try {
      const res = await fetch(`/api/fetch-linkedin-post?url=${encodeURIComponent(linkedinPostUrl)}`);
      if (res.ok) {
        const json = await res.json();
        
        const slug = json.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `imported-${Date.now()}`;
        
        const newProj: CustomProject = {
          slug,
          content: `### ${json.title}\n\n${json.description}\n\n[Read full LinkedIn post](${json.url})`,
          metadata: {
            title: json.title,
            summary: json.description.substring(0, 150) + "...",
            image: json.image,
            images: [json.image],
            tag: "LinkedIn Import",
            team: [
              {
                name: data.person.name,
                role: data.person.role,
                avatar: data.person.avatar,
                linkedIn: linkedinUrl,
              }
            ],
            link: json.url,
            publishedAt: new Date().toISOString().split("T")[0],
          }
        };
        
        setData({
          ...data,
          projects: [...(data.projects || []), newProj]
        });
        
        addToast({ variant: "success", message: "LinkedIn post imported into work projects!" });
        setLinkedinPostUrl("");
      } else {
        addToast({ variant: "danger", message: "Failed to parse LinkedIn post. Make sure it is public." });
      }
    } catch (err) {
      console.error(err);
      addToast({ variant: "danger", message: "An error occurred during post import." });
    } finally {
      setImportingPost(false);
    }
  };

  if (loading) {
    return (
      <Flex fillWidth paddingY="128" horizontal="center" vertical="center">
        <Spinner size="l" />
        <Text marginTop="m">Loading CRM Dashboard...</Text>
      </Flex>
    );
  }

  if (!data) {
    return (
      <Flex fillWidth paddingY="128" horizontal="center" vertical="center">
        <Text variant="heading-strong-l" onBackground="neutral-strong">No data available</Text>
      </Flex>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Left Sidebar Menu */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>AbhiCRM</span>
        </div>
        <nav className={styles.sidebarMenu}>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`${styles.sidebarButton} ${activeTab === "dashboard" ? styles.active : ""}`}
          >
            <span className={styles.btnIcon}>📊</span> Dashboard Stats
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`${styles.sidebarButton} ${activeTab === "profile" ? styles.active : ""}`}
          >
            <span className={styles.btnIcon}>👤</span> Profile & Socials
          </button>
          <button
            onClick={() => setActiveTab("home")}
            className={`${styles.sidebarButton} ${activeTab === "home" ? styles.active : ""}`}
          >
            <span className={styles.btnIcon}>🏠</span> Homepage Hero
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`${styles.sidebarButton} ${activeTab === "projects" ? styles.active : ""}`}
          >
            <span className={styles.btnIcon}>💼</span> Work Projects
          </button>
          <button
            onClick={() => setActiveTab("experience")}
            className={`${styles.sidebarButton} ${activeTab === "experience" ? styles.active : ""}`}
          >
            <span className={styles.btnIcon}>🏢</span> Experiences Bio
          </button>
          <button
            onClick={() => setActiveTab("education")}
            className={`${styles.sidebarButton} ${activeTab === "education" ? styles.active : ""}`}
          >
            <span className={styles.btnIcon}>🎓</span> Education & Skills
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`${styles.sidebarButton} ${activeTab === "gallery" ? styles.active : ""}`}
          >
            <span className={styles.btnIcon}>🖼️</span> Photo Gallery
          </button>
        </nav>

        <div className={styles.statusIndicator}>
          {isFirebase ? (
            <div className={`${styles.statusBadge} ${styles.connected}`}>
              <span className={styles.pulseDot}></span> Firestore Live
            </div>
          ) : (
            <div className={`${styles.statusBadge} ${styles.local}`}>
              <span className={styles.pulseDot}></span> Local Fallback DB
            </div>
          )}
        </div>

        <div className={styles.sidebarUserCard}>
          <img src={data.person.avatar || "/images/avatar.jpg"} alt="Avatar" className={styles.userAvatar} />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{data.person.name}</span>
            <span className={styles.userRole}>{data.person.role}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Top Navbar */}
        <div className={styles.topNavbar}>
          <div className={styles.searchBar}>
            <span className={styles.searchIcon}>🔍</span>
            <input type="text" placeholder="Search settings, projects, credentials..." disabled />
          </div>
          <div className={styles.navbarActions}>
            <button className={`${styles.navBtn} ${styles.customizeBtn}`}>Customize</button>
            <button className={`${styles.navBtn} ${styles.exportBtn}`}>Export</button>
            <Button onClick={handleSave} loading={saving} variant="primary" size="s">
              Save Config
            </Button>
            <div className={styles.userNavAvatar}>
              <img src={data.person.avatar || "/images/avatar.jpg"} alt="Avatar" />
            </div>
          </div>
        </div>

        {/* Scrollable Workspace */}
        <div className={styles.workspace}>
          {/* 1. DASHBOARD ANALYTICS OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className={styles.tabContent}>
              <div className={styles.dashboardHeader}>
                <h1 className={styles.dashboardTitle}>Dashboard</h1>
                <p className={styles.dashboardSubtitle}>
                  Welcome back, {data.person.name}! Here's what's happening with your portfolio today.
                </p>
              </div>

              {/* Firestore Permission Denied Alert Banner */}
              {(data as any)._firestoreError === "permission-denied" && (
                <div className={styles.warningBanner}>
                  <div className={styles.warningIcon}>⚠️</div>
                  <div className={styles.warningContent}>
                    <h4 className={styles.warningTitle}>Firestore Permissions Check Required</h4>
                    <p className={styles.warningText}>
                      Your portfolio settings are currently saving only to the <strong>Local Fallback DB</strong> because the application encountered a <strong>permission-denied</strong> error when querying your Firestore database.
                    </p>
                    <p className={styles.warningLinkText}>
                      To fix this, go to your Firebase Console under "Firestore Database" &rarr; "Rules", and update your security rules to allow read/write:
                    </p>
                    <pre className={styles.warningCode}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /portfolio/data {
      allow read, write: if true;
    }
  }
}`}
                    </pre>
                  </div>
                </div>
              )}

              {/* Metric grid */}
              <div className={styles.metricGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>Dynamic Projects</span>
                    <span className={`${styles.metricIcon} ${styles.purple}`}>💼</span>
                  </div>
                  <span className={`${styles.metricNum} ${styles.purple}`}>{data.projects?.length || 0}</span>
                  <span className={`${styles.metricTrend} ${styles.up}`}>↑ 100% vs last month</span>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>Work History</span>
                    <span className={`${styles.metricIcon} ${styles.indigo}`}>🏢</span>
                  </div>
                  <span className={`${styles.metricNum} ${styles.indigo}`}>{data.about.work.experiences.length}</span>
                  <span className={`${styles.metricTrend} ${styles.up}`}>↑ 14.3% vs last month</span>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>Skill Groups</span>
                    <span className={`${styles.metricIcon} ${styles.teal}`}>🎓</span>
                  </div>
                  <span className={`${styles.metricNum} ${styles.teal}`}>{data.about.technical.skills.length}</span>
                  <span className={`${styles.metricTrend} ${styles.up}`}>↑ 22.5% vs last month</span>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>Gallery Assets</span>
                    <span className={`${styles.metricIcon} ${styles.rose}`}>🖼️</span>
                  </div>
                  <span className={`${styles.metricNum} ${styles.rose}`}>{data.gallery.images.length}</span>
                  <span className={`${styles.metricTrend} ${styles.down}`}>↓ 8.3% vs last month</span>
                </div>
              </div>

              {/* Lower Section Grid: CV Importer + Activities + Checklist */}
              <div className={styles.dashboardLowerGrid}>
                {/* PDF CV Uploader */}
                <div className={styles.glassCard}>
                  <h3 className={styles.sectionHeading}>Quick CV Importer</h3>
                  <p className={styles.sectionSubtext}>
                    Upload your resume PDF to instantly extract details and auto-populate your profile.
                  </p>
                  <label className={styles.uploadZone}>
                    {parsingPdf ? (
                      <>
                        <Spinner size="m" />
                        <Text marginTop="s">Analyzing PDF contents...</Text>
                      </>
                    ) : (
                      <>
                        <span className={styles.uploadIcon}>📄</span>
                        <Text variant="label-strong-l" onBackground="neutral-strong">
                          Select CV/Resume PDF File
                        </Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          Click to browse file and run the auto-importer
                        </Text>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      style={{ display: "none" }}
                      onChange={handlePdfUpload}
                      disabled={parsingPdf}
                    />
                  </label>
                </div>

                {/* Recent Activities */}
                <div className={styles.glassCard}>
                  <h3 className={styles.sectionHeading}>Recent Activities</h3>
                  <div className={styles.activityList}>
                    <div className={styles.activityItem}>
                      <span className={`${styles.activityDot} ${styles.purple}`}></span>
                      <div className={styles.activityInfo}>
                        <p className={styles.activityTitle}>Local JSON fallback database loaded</p>
                        <span className={styles.activityTime}>Just now</span>
                      </div>
                    </div>
                    <div className={styles.activityItem}>
                      <span className={`${styles.activityDot} ${styles.indigo}`}></span>
                      <div className={styles.activityInfo}>
                        <p className={styles.activityTitle}>API routes compiled successfully</p>
                        <span className={styles.activityTime}>2 mins ago</span>
                      </div>
                    </div>
                    <div className={styles.activityItem}>
                      <span className={`${styles.activityDot} ${styles.teal}`}></span>
                      <div className={styles.activityInfo}>
                        <p className={styles.activityTitle}>Dynamic work projects sync online</p>
                        <span className={styles.activityTime}>10 mins ago</span>
                      </div>
                    </div>
                    <div className={styles.activityItem}>
                      <span className={`${styles.activityDot} ${styles.rose}`}></span>
                      <div className={styles.activityInfo}>
                        <p className={styles.activityTitle}>CV parser module initialized</p>
                        <span className={styles.activityTime}>1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pending Tasks Checklist */}
                <div className={styles.glassCard}>
                  <h3 className={styles.sectionHeading}>Pending Checklist</h3>
                  <div className={styles.taskList}>
                    <label className={styles.taskItem}>
                      <input type="checkbox" defaultChecked disabled />
                      <span className={styles.taskText}>Verify API imports configuration</span>
                    </label>
                    <label className={styles.taskItem}>
                      <input type="checkbox" defaultChecked disabled />
                      <span className={styles.taskText}>Build portfolio router links</span>
                    </label>
                    <label className={styles.taskItem}>
                      <input type="checkbox" />
                      <span className={styles.taskText}>Import work projects from LinkedIn</span>
                    </label>
                    <label className={styles.taskItem}>
                      <input type="checkbox" />
                      <span className={styles.taskText}>Update profile details & skills list</span>
                    </label>
                    <label className={styles.taskItem}>
                      <input type="checkbox" />
                      <span className={styles.taskText}>Save system configurations</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PROFILE & SOCIALS TAB */}
          {activeTab === "profile" && (
            <div className={styles.tabContent}>
              <div className={styles.glassCard}>
                <Heading variant="heading-strong-xl" marginBottom="s">Profile Settings</Heading>
                
                {/* LinkedIn Photo Sync */}
                <div className={styles.syncContainer}>
                  <div className={styles.syncText}>
                    <Text variant="label-strong-l" onBackground="neutral-strong">LinkedIn Profile Photo Sync</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak" marginTop="4">
                      Retrieve your LinkedIn profile avatar link instantly using your URL.
                    </Text>
                  </div>
                  <div className={styles.syncForm}>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                    <Button onClick={syncLinkedInPhoto} variant="secondary" size="s">Sync Photo</Button>
                  </div>
                </div>

                <Row gap="24" vertical="center" wrap>
                  <Avatar size="xl" src={data.person.avatar || "/images/avatar.jpg"} />
                  <Column gap="8" style={{ flex: 1 }}>
                    <label className={styles.label}>Avatar Image Source</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={data.person.avatar}
                      onChange={(e) => {
                        const cleaned = cleanGoogleDriveUrl(e.target.value);
                        setData({ ...data, person: { ...data.person, avatar: cleaned } });
                      }}
                    />
                    <span className={styles.helperText}>
                      Supports direct urls, Google Drive share links, or synced LinkedIn avatar links.
                    </span>
                  </Column>
                </Row>

                <div className={styles.rowGrid} style={{ marginTop: "1rem" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Display Full Name</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={data.person.name}
                      onChange={(e) => setData({ ...data, person: { ...data.person, name: e.target.value } })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Professional Title</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={data.person.role}
                      onChange={(e) => setData({ ...data, person: { ...data.person, role: e.target.value } })}
                    />
                  </div>
                </div>

                <div className={styles.rowGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Contact Email</label>
                    <input
                      type="email"
                      className={styles.input}
                      value={data.person.email}
                      onChange={(e) => setData({ ...data, person: { ...data.person, email: e.target.value } })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Location / Timezone (e.g., Asia/Kolkata)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={data.person.location}
                      onChange={(e) => setData({ ...data, person: { ...data.person, location: e.target.value } })}
                    />
                  </div>
                </div>

                {/* Social Networks */}
                <Heading variant="heading-strong-l" marginTop="m" marginBottom="s">Footer Links & Socials</Heading>
                {data.social.map((soc, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.removeBtn}>
                      <IconButton
                        icon="close"
                        variant="ghost"
                        onClick={() => {
                          const updated = data.social.filter((_, i) => i !== idx);
                          setData({ ...data, social: updated });
                        }}
                      />
                    </div>
                    <div className={styles.rowGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Platform</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={soc.name}
                          onChange={(e) => {
                            const updated = [...data.social];
                            updated[idx].name = e.target.value;
                            setData({ ...data, social: updated });
                          }}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Icon slug</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={soc.icon}
                          onChange={(e) => {
                            const updated = [...data.social];
                            updated[idx].icon = e.target.value;
                            setData({ ...data, social: updated });
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.rowGrid} style={{ marginTop: "1rem" }}>
                      <div className={styles.formGroup} style={{ flex: 3 }}>
                        <label className={styles.label}>Link Href</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={soc.link}
                          onChange={(e) => {
                            const updated = [...data.social];
                            updated[idx].link = e.target.value;
                            setData({ ...data, social: updated });
                          }}
                        />
                      </div>
                      <div className={styles.formGroup} style={{ flex: 1 }}>
                        <label className={styles.label}>Show on About</label>
                        <select
                          className={styles.select}
                          value={soc.essential ? "true" : "false"}
                          onChange={(e) => {
                            const updated = [...data.social];
                            updated[idx].essential = e.target.value === "true";
                            setData({ ...data, social: updated });
                          }}
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  size="s"
                  onClick={() => {
                    setData({
                      ...data,
                      social: [...data.social, { name: "New Social", icon: "link", link: "https://", essential: true }]
                    });
                  }}
                >
                  Add Social Network
                </Button>
              </div>
            </div>
          )}

          {/* 3. HOMEPAGE TAB */}
          {activeTab === "home" && (
            <div className={styles.tabContent}>
              <div className={styles.glassCard}>
                <Heading variant="heading-strong-xl" marginBottom="m">Homepage Cover Settings</Heading>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Main Hero Headline</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={data.home.headline}
                    onChange={(e) => setData({ ...data, home: { ...data.home, headline: e.target.value } })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Main Hero Subline</label>
                  <textarea
                    className={styles.textarea}
                    value={data.home.subline}
                    onChange={(e) => setData({ ...data, home: { ...data.home, subline: e.target.value } })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Homepage Background Image URL</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={data.home.image}
                    onChange={(e) => {
                      const cleaned = cleanGoogleDriveUrl(e.target.value);
                      setData({ ...data, home: { ...data.home, image: cleaned } });
                    }}
                  />
                  <span className={styles.helperText}>
                    Supports direct urls or Google Drive links. Re-formats drive shares on pasting.
                  </span>
                </div>

                {/* Quick picker */}
                <Column gap="8" marginBottom="m">
                  <label className={styles.label}>Or select standard background image</label>
                  <div className={styles.mockImgGrid}>
                    {MOCK_IMAGES.slice(5, 9).map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setData({ ...data, home: { ...data.home, image: img } })}
                        className={`${styles.mockImgItem} ${data.home.image === img ? styles.selected : ""}`}
                      >
                        <img src={img} alt={`Mock ${i}`} />
                      </div>
                    ))}
                  </div>
                </Column>

                <Heading variant="heading-strong-l" marginTop="l" marginBottom="s">Featured Project Tag</Heading>
                <div className={styles.rowGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Show Tag</label>
                    <select
                      className={styles.select}
                      value={data.home.featured.display ? "true" : "false"}
                      onChange={(e) => setData({
                        ...data,
                        home: { ...data.home, featured: { ...data.home.featured, display: e.target.value === "true" } }
                      })}
                    >
                      <option value="true">Visible</option>
                      <option value="false">Hidden</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Action Href</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={data.home.featured.href}
                      onChange={(e) => setData({
                        ...data,
                        home: { ...data.home, featured: { ...data.home.featured, href: e.target.value } }
                      })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tag text</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={data.home.featured.title}
                    onChange={(e) => setData({
                      ...data,
                      home: { ...data.home, featured: { ...data.home.featured, title: e.target.value } }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. PROJECTS TAB */}
          {activeTab === "projects" && (
            <div className={styles.tabContent}>
              <div className={styles.glassCard}>
                <Heading variant="heading-strong-xl" marginBottom="s">Dynamic Projects Manager</Heading>
                <Text variant="body-default-m" onBackground="neutral-weak" marginBottom="m">
                  Add, edit, or delete dynamic project cards in your portfolio. Paste a LinkedIn post URL below to automatically fetch and convert its contents.
                </Text>

                {/* LinkedIn Post Reader */}
                <div className={styles.syncContainer}>
                  <div className={styles.syncText}>
                    <Text variant="label-strong-l" onBackground="neutral-strong">LinkedIn Post Importer</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak" marginTop="4">
                      Paste a link to any public LinkedIn post to fetch details and generate a project entry.
                    </Text>
                  </div>
                  <div className={styles.syncForm}>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="https://www.linkedin.com/posts/activity-..."
                      value={linkedinPostUrl}
                      onChange={(e) => setLinkedinPostUrl(e.target.value)}
                    />
                    <Button onClick={handleLinkedInPostImport} loading={importingPost} variant="secondary" size="s">
                      Import Post
                    </Button>
                  </div>
                </div>

                {/* Dynamic Projects Form List */}
                <Heading variant="heading-strong-l" marginBottom="s">Project Cards List</Heading>
                {(data.projects || []).map((proj, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.removeBtn}>
                      <IconButton
                        icon="close"
                        variant="ghost"
                        onClick={() => {
                          const updated = (data.projects || []).filter((_, i) => i !== idx);
                          setData({ ...data, projects: updated });
                        }}
                      />
                    </div>

                    <div className={styles.rowGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Project Title</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={proj.metadata.title}
                          onChange={(e) => {
                            const updated = [...(data.projects || [])];
                            updated[idx].metadata.title = e.target.value;
                            setData({ ...data, projects: updated });
                          }}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>URL Slug (unique path, e.g. "my-project")</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={proj.slug}
                          onChange={(e) => {
                            const updated = [...(data.projects || [])];
                            updated[idx].slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                            setData({ ...data, projects: updated });
                          }}
                        />
                      </div>
                    </div>

                    <div className={styles.rowGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Project Tag Category</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={proj.metadata.tag}
                          onChange={(e) => {
                            const updated = [...(data.projects || [])];
                            updated[idx].metadata.tag = e.target.value;
                            setData({ ...data, projects: updated });
                          }}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Project Action URL Link</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={proj.metadata.link}
                          onChange={(e) => {
                            const updated = [...(data.projects || [])];
                            updated[idx].metadata.link = e.target.value;
                            setData({ ...data, projects: updated });
                          }}
                        />
                      </div>
                    </div>

                    <Row gap="24" vertical="center" wrap style={{ margin: "1rem 0" }}>
                      {proj.metadata.image && (
                        <img
                          src={proj.metadata.image}
                          alt="Cover"
                          style={{
                            width: "120px",
                            height: "68px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid rgba(255, 255, 255, 0.1)"
                          }}
                        />
                      )}
                      <div className={styles.formGroup} style={{ flex: 1, minWidth: "240px" }}>
                        <label className={styles.label}>Project Cover Image URL</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={proj.metadata.image}
                          onChange={(e) => {
                            const cleaned = cleanGoogleDriveUrl(e.target.value);
                            const updated = [...(data.projects || [])];
                            updated[idx].metadata.image = cleaned;
                            updated[idx].metadata.images = [cleaned];
                            setData({ ...data, projects: updated });
                          }}
                        />
                      </div>
                    </Row>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Card Summary</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={proj.metadata.summary}
                        onChange={(e) => {
                          const updated = [...(data.projects || [])];
                          updated[idx].metadata.summary = e.target.value;
                          setData({ ...data, projects: updated });
                        }}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Detailed Description (Markdown Supported)</label>
                      <textarea
                        className={styles.textarea}
                        value={proj.content}
                        onChange={(e) => {
                          const updated = [...(data.projects || [])];
                          updated[idx].content = e.target.value;
                          setData({ ...data, projects: updated });
                        }}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  variant="secondary"
                  size="s"
                  onClick={() => {
                    const newProj: CustomProject = {
                      slug: `project-${Date.now()}`,
                      content: "### Project Heading\n\nWrite about your project details here.",
                      metadata: {
                        title: "New Project",
                        summary: "Enter a brief card summary.",
                        image: MOCK_IMAGES[0],
                        images: [MOCK_IMAGES[0]],
                        tag: "Web Design",
                        team: [
                          {
                            name: data.person.name,
                            role: data.person.role,
                            avatar: data.person.avatar,
                            linkedIn: linkedinUrl,
                          }
                        ],
                        link: "",
                        publishedAt: new Date().toISOString().split("T")[0]
                      }
                    };
                    setData({
                      ...data,
                      projects: [...(data.projects || []), newProj]
                    });
                  }}
                >
                  Add Project Card
                </Button>
              </div>
            </div>
          )}

          {/* 5. EXPERIENCES TAB */}
          {activeTab === "experience" && (
            <div className={styles.tabContent}>
              <div className={styles.glassCard}>
                <Heading variant="heading-strong-xl" marginBottom="s">About Biography</Heading>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Intro paragraph</label>
                  <textarea
                    className={styles.textarea}
                    value={data.about.intro.description}
                    onChange={(e) => setData({
                      ...data,
                      about: { ...data.about, intro: { ...data.about.intro, description: e.target.value } }
                    })}
                  />
                </div>

                <div className={styles.rowGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Calendar Visibility</label>
                    <select
                      className={styles.select}
                      value={data.about.calendar.display ? "true" : "false"}
                      onChange={(e) => setData({
                        ...data,
                        about: { ...data.about, calendar: { ...data.about.calendar, display: e.target.value === "true" } }
                      })}
                    >
                      <option value="true">Show scheduler</option>
                      <option value="false">Hide scheduler</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Calendar Link</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={data.about.calendar.link}
                      onChange={(e) => setData({
                        ...data,
                        about: { ...data.about, calendar: { ...data.about.calendar, link: e.target.value } }
                      })}
                    />
                  </div>
                </div>

                <Heading variant="heading-strong-l" marginTop="m" marginBottom="s">Work Experience History</Heading>
                {data.about.work.experiences.map((exp, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.removeBtn}>
                      <IconButton
                        icon="close"
                        variant="ghost"
                        onClick={() => {
                          const updated = data.about.work.experiences.filter((_, i) => i !== idx);
                          setData({
                            ...data,
                            about: { ...data.about, work: { ...data.about.work, experiences: updated } }
                          });
                        }}
                      />
                    </div>
                    <div className={styles.rowGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Company</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...data.about.work.experiences];
                            updated[idx].company = e.target.value;
                            setData({ ...data, about: { ...data.about, work: { ...data.about.work, experiences: updated } } });
                          }}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Dates</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={exp.timeframe}
                          onChange={(e) => {
                            const updated = [...data.about.work.experiences];
                            updated[idx].timeframe = e.target.value;
                            setData({ ...data, about: { ...data.about, work: { ...data.about.work, experiences: updated } } });
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Role</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...data.about.work.experiences];
                          updated[idx].role = e.target.value;
                          setData({ ...data, about: { ...data.about, work: { ...data.about.work, experiences: updated } } });
                        }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Achievements (bullet points - newline split)</label>
                      <textarea
                        className={styles.textarea}
                        value={exp.achievements.join("\n")}
                        onChange={(e) => {
                          const updated = [...data.about.work.experiences];
                          updated[idx].achievements = e.target.value.split("\n");
                          setData({ ...data, about: { ...data.about, work: { ...data.about.work, experiences: updated } } });
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  size="s"
                  onClick={() => {
                    setData({
                      ...data,
                      about: {
                        ...data.about,
                        work: {
                          ...data.about.work,
                          experiences: [
                            ...data.about.work.experiences,
                            { company: "New Company", timeframe: "2026 - Present", role: "Role", achievements: ["Task done."], images: [] }
                          ]
                        }
                      }
                    });
                  }}
                >
                  Add Work History
                </Button>
              </div>
            </div>
          )}

          {/* 6. EDUCATION & SKILLS TAB */}
          {activeTab === "education" && (
            <div className={styles.tabContent}>
              <div className={styles.glassCard}>
                <Heading variant="heading-strong-xl" marginBottom="s">Education</Heading>
                {data.about.studies.institutions.map((inst, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.removeBtn}>
                      <IconButton
                        icon="close"
                        variant="ghost"
                        onClick={() => {
                          const updated = data.about.studies.institutions.filter((_, i) => i !== idx);
                          setData({ ...data, about: { ...data.about, studies: { ...data.about.studies, institutions: updated } } });
                        }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>School / Institute</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={inst.name}
                        onChange={(e) => {
                          const updated = [...data.about.studies.institutions];
                          updated[idx].name = e.target.value;
                          setData({ ...data, about: { ...data.about, studies: { ...data.about.studies, institutions: updated } } });
                        }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Degree details</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={inst.description}
                        onChange={(e) => {
                          const updated = [...data.about.studies.institutions];
                          updated[idx].description = e.target.value;
                          setData({ ...data, about: { ...data.about, studies: { ...data.about.studies, institutions: updated } } });
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  size="s"
                  onClick={() => {
                    setData({
                      ...data,
                      about: {
                        ...data.about,
                        studies: {
                          ...data.about.studies,
                          institutions: [...data.about.studies.institutions, { name: "School", description: "B.Tech" }]
                        }
                      }
                    });
                  }}
                >
                  Add Education Card
                </Button>

                <Heading variant="heading-strong-l" marginTop="l" marginBottom="s">Skill Groups</Heading>
                {data.about.technical.skills.map((skill, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.removeBtn}>
                      <IconButton
                        icon="close"
                        variant="ghost"
                        onClick={() => {
                          const updated = data.about.technical.skills.filter((_, i) => i !== idx);
                          setData({ ...data, about: { ...data.about, technical: { ...data.about.technical, skills: updated } } });
                        }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Group Title</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={skill.title}
                        onChange={(e) => {
                          const updated = [...data.about.technical.skills];
                          updated[idx].title = e.target.value;
                          setData({ ...data, about: { ...data.about, technical: { ...data.about.technical, skills: updated } } });
                        }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Description</label>
                      <textarea
                        className={styles.textarea}
                        value={skill.description}
                        onChange={(e) => {
                          const updated = [...data.about.technical.skills];
                          updated[idx].description = e.target.value;
                          setData({ ...data, about: { ...data.about, technical: { ...data.about.technical, skills: updated } } });
                        }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Tags (comma-separated)</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={skill.tags.map(t => t.name).join(", ")}
                        onChange={(e) => {
                          const updated = [...data.about.technical.skills];
                          updated[idx].tags = e.target.value.split(",").map(t => {
                            const name = t.trim();
                            let icon = "code";
                            const lower = name.toLowerCase();
                            if (lower.includes("react")) icon = "react";
                            else if (lower.includes("node")) icon = "node";
                            else if (lower.includes("mongo")) icon = "mongodb";
                            else if (lower.includes("ai") || lower.includes("prompt")) icon = "ai";
                            else if (lower.includes("iot")) icon = "iot";
                            else if (lower.includes("automation") || lower.includes("n8n")) icon = "automation";
                            return { name, icon };
                          });
                          setData({ ...data, about: { ...data.about, technical: { ...data.about.technical, skills: updated } } });
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  size="s"
                  onClick={() => {
                    setData({
                      ...data,
                      about: {
                        ...data.about,
                        technical: {
                          ...data.about.technical,
                          skills: [...data.about.technical.skills, { title: "New Group", description: "Details", tags: [], images: [] }]
                        }
                      }
                    });
                  }}
                >
                  Add Skill Group
                </Button>
              </div>
            </div>
          )}

          {/* 7. GALLERY TAB */}
          {activeTab === "gallery" && (
            <div className={styles.tabContent}>
              <div className={styles.glassCard}>
                <Heading variant="heading-strong-xl" marginBottom="s">Photo Gallery</Heading>
                {data.gallery.images.map((img, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.removeBtn}>
                      <IconButton
                        icon="close"
                        variant="ghost"
                        onClick={() => {
                          const updated = data.gallery.images.filter((_, i) => i !== idx);
                          setData({ ...data, gallery: { ...data.gallery, images: updated } });
                        }}
                      />
                    </div>
                    <Row gap="24" vertical="center" wrap>
                      {img.src && (
                        <img
                          src={img.src}
                          alt="preview"
                          style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                        />
                      )}
                      <div className={styles.formGroup} style={{ flex: 1 }}>
                        <label className={styles.label}>Image URL</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={img.src}
                          onChange={(e) => {
                            const cleaned = cleanGoogleDriveUrl(e.target.value);
                            const updated = [...data.gallery.images];
                            updated[idx].src = cleaned;
                            setData({ ...data, gallery: { ...data.gallery, images: updated } });
                          }}
                        />
                      </div>
                    </Row>
                    <div className={styles.rowGrid} style={{ marginTop: "1rem" }}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Alt Text</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={img.alt}
                          onChange={(e) => {
                            const updated = [...data.gallery.images];
                            updated[idx].alt = e.target.value;
                            setData({ ...data, gallery: { ...data.gallery, images: updated } });
                          }}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Orientation</label>
                        <select
                          className={styles.select}
                          value={img.orientation}
                          onChange={(e) => {
                            const updated = [...data.gallery.images];
                            updated[idx].orientation = e.target.value as any;
                            setData({ ...data, gallery: { ...data.gallery, images: updated } });
                          }}
                        >
                          <option value="horizontal">Horizontal</option>
                          <option value="vertical">Vertical</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  size="s"
                  onClick={() => {
                    setData({
                      ...data,
                      gallery: { ...data.gallery, images: [...data.gallery.images, { src: MOCK_IMAGES[0], alt: "Image", orientation: "horizontal" }] }
                    });
                  }}
                >
                  Add Gallery Image
                </Button>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className={styles.actionRow}>
            <Text onBackground="neutral-weak" style={{ marginRight: "auto", alignSelf: "center" }}>
              Unsaved changes will be lost if you refresh or navigate away.
            </Text>
            <Button onClick={handleSave} loading={saving} variant="primary" size="m">
              Save System Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
