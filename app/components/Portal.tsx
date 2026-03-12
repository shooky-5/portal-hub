'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useUserSettings } from '@/app/hooks/useUserSettings';
import { useAppStatus } from '@/app/hooks/useAppStatus';
import { useUserSessions } from '@/app/hooks/useUserSessions';
import { useLastRun } from '@/app/hooks/useLastRun';
import { usePlatformStatus } from '@/app/hooks/usePlatformStatus';

// ── THEME TOKENS ─────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    mode: 'dark',
    bgPage: '#0F172A',
    bgSurface: '#1E293B',
    bgElev: '#334155',
    border: '#475569',
    textPri: '#F8FAFC',
    textSec: '#94A3B8',
    accent: '#60A5FA',
    accentHov: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#F43F5E',
    sidebarBg: '#1E293B',
    headerBg: '#0F172A',
    inputBg: '#334155',
    logoStroke: '#60A5FA',
    logoFill: 'rgba(96,165,250,0.07)',
    logoRing: 'rgba(96,165,250,0.18)',
  },
  light: {
    mode: 'light',
    bgPage: '#F0F4FA',
    bgSurface: '#FFFFFF',
    bgElev: '#EBF2FB',
    border: '#C0CEDF',
    textPri: '#1A2B42',
    textSec: '#5A7490',
    accent: '#2E75B6',
    accentHov: '#1A4670',
    success: '#2E7D32',
    warning: '#B45309',
    error: '#C62828',
    sidebarBg: '#1F3864',
    headerBg: '#FFFFFF',
    inputBg: '#FFFFFF',
    logoStroke: '#FFFFFF',
    logoFill: 'rgba(255,255,255,0.07)',
    logoRing: 'rgba(255,255,255,0.18)',
  },
};

const P_ACCENTS = {
  dark: ['#60A5FA', '#93C5FD', '#3B82F6', '#BFDBFE', '#60A5FA'],
  light: ['#2E75B6', '#1A4670', '#1F3864', '#2E75B6', '#0F1D34'],
};

const PRINCIPLES = [
  {
    label: 'Transparency',
    note: 'Every conclusion traces to its source',
    icon: 'info',
  },
  {
    label: 'Structured Challenge',
    note: 'Contradictions are surfaced by design',
    icon: 'triangle',
  },
  {
    label: 'Human Authority',
    note: 'Humans decide; machines advise',
    icon: 'check',
  },
  {
    label: 'Data Integrity',
    note: 'Provenance and quality assured',
    icon: 'shield',
  },
  {
    label: 'Context First',
    note: 'Answers adjust with new conditions',
    icon: 'info',
  },
];

interface ThemeContextType {
  T: typeof THEMES.dark;
  isDark: boolean;
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeContextType | undefined>(undefined);
const useTheme = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};

// ── ICONS ────────────────────────────────────────────────────────────────
const ICONS: { [key: string]: string | string[] } = {
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  clock: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  settings: [
    'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
    'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    'M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M4.93 19.07l1.41-1.41 M17.66 6.34l1.41-1.41',
  ],
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  layers: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  compass: ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z'],
  network: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
  barchart: 'M18 20V10 M12 20V4 M6 20v-6',
  radio: ['M4.9 19.1C1 15.2 1 8.8 4.9 4.9', 'M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5', 'M12 12h.01', 'M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5', 'M19.1 4.9C23 8.8 23 15.2 19.1 19.1'],
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  chevron: 'M9 18l6-6-6-6',
  triangle: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  check: ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'],
  info: ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 16v-4', 'M12 8h.01'],
  sun: [
    'M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42',
    'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  ],
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
};

interface IconProps {
  path: string | string[];
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

function Icon({ path, size = 24, color = 'currentColor', style }: IconProps) {
  const paths = Array.isArray(path) ? path : [path];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        ...style,
      }}
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}

// ── HEADER COMPONENTS ─────────────────────────────────────────────────────
interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  const { T } = useTheme();
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: T.textSec,
          marginBottom: 12,
        }}
      >
        {eyebrow}
      </div>
      <h1
        style={{
          fontSize: 32,
          fontWeight: 500,
          color: T.textPri,
          marginBottom: subtitle ? 12 : 0,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: 15,
            color: T.textSec,
            lineHeight: 1.6,
            maxWidth: 700,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── APP CARD ──────────────────────────────────────────────────────────────
interface AppCardProps {
  app: any;
  delay: number;
  onLaunch: () => void;
  lastRun: string | null;
}

function AppCard({ app, delay, onLaunch, lastRun }: AppCardProps) {
  const { T } = useTheme();
  const [hov, setHov] = useState(false);

  const isUnderDev = app.status === 'under_development';
  const isActive = app.status === 'active';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${app.name} application${isUnderDev ? ' (under development)' : ''}`}
      style={{
        background: T.bgSurface,
        border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${hov ? app.color : T.border}`,
        borderRadius: 8,
        padding: 24,
        position: 'relative',
        cursor: isActive ? 'pointer' : 'default',
        overflow: 'hidden',
        transition: 'all 200ms ease-in-out',
        opacity: hov && isActive ? 1 : 0.95,
        transform: hov && isActive ? 'translateY(-2px)' : 'translateY(0)',
        animation: `slideUp 500ms ease-out ${delay}ms both`,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={isActive ? onLaunch : undefined}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <Icon
          path={ICONS[app.icon] || ICONS.layers}
          size={32}
          color={app.color}
          style={{
            background: `${app.color}14`,
            padding: 8,
            borderRadius: 8,
          }}
        />
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: isActive ? T.success : T.warning,
            background: isActive ? `${T.success}15` : `${T.warning}15`,
            padding: '4px 8px',
            borderRadius: 4,
          }}
        >
          {isActive ? 'ACTIVE' : 'UNDER DEVELOPMENT'}
        </div>
      </div>

      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: T.textPri,
          marginBottom: 6,
          letterSpacing: '-0.01em',
        }}
      >
        {app.name}
      </h3>

      <p
        style={{
          fontFamily: "'Newsreader',serif",
          fontSize: 13,
          color: T.textSec,
          marginBottom: 14,
          lineHeight: 1.6,
          minHeight: 52,
        }}
      >
        {app.description}
      </p>

      {lastRun && (
        <div
          style={{
            fontSize: 11,
            color: T.textSec,
            marginBottom: 12,
          }}
        >
          Last run: <strong>{lastRun}</strong>
        </div>
      )}

      {isActive && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: app.color,
            cursor: 'pointer',
            transition: 'color 200ms ease-in-out',
          }}
        >
          Launch
          <Icon
            path={ICONS.chevron}
            size={14}
            color="currentColor"
            style={{
              transform: hov ? 'translateX(3px)' : 'translateX(0)',
              transition: 'transform 200ms ease-in-out',
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── VIEWS ─────────────────────────────────────────────────────────────────

function ArmoryView() {
  const { T, isDark } = useTheme();
  const { currentUser } = useAuth();
  const { apps } = useAppStatus();
  const { lastRunMap, updateLastRun } = useLastRun(apps.map((a) => a.id));

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const name = currentUser
    ? currentUser.fullName.charAt(0) + currentUser.fullName.slice(1).toLowerCase().replace('.', ' ')
    : 'Analyst';
  const pAccents = P_ACCENTS[isDark ? 'dark' : 'light'];

  return (
    <div style={{ padding: '40px 40px 64px' }}>
      <PageHeader
        eyebrow="Mission Applications"
        title={`${greeting}, ${name}.`}
        subtitle="Select a mission tool to begin structured analysis."
      />
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 3,
            height: 16,
            background: T.accent,
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'Newsreader',serif",
            fontSize: 15,
            fontStyle: 'italic',
            color: T.textSec,
          }}
        >
          Built on the premise that AI should challenge, not confirm.
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
        {apps.map((app, i) => (
          <AppCard
            key={app.id}
            app={app}
            delay={60 + i * 70}
            onLaunch={async () => {
              await updateLastRun(app.id);
              if (app.url && app.url !== '#') {
                window.open(app.url, '_blank');
              }
            }}
            lastRun={lastRunMap[app.id]?.timeAgo}
          />
        ))}
      </div>
      <div
        style={{
          marginTop: 48,
          textAlign: 'center',
          fontFamily: "'Newsreader',serif",
          fontSize: 17,
          fontStyle: 'italic',
          color: T.textPri,
          opacity: 0.6,
        }}
      >
        If the mission requires a tool that does not exist here — we build it.
      </div>

      {/* Platform Principles */}
      <div
        style={{
          marginTop: 52,
          paddingTop: 32,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: T.textSec,
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          Platform Principles
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
          {PRINCIPLES.map((p, i) => {
            const col = pAccents[i];
            return (
              <div
                key={i}
                style={{
                  background: isDark
                    ? `linear-gradient(150deg,${col}14 0%,${T.bgSurface} 60%)`
                    : `linear-gradient(150deg,${col}0E 0%,${T.bgSurface} 60%)`,
                  border: `1px solid ${col}30`,
                  borderTop: `3px solid ${col}`,
                  borderRadius: 8,
                  padding: '18px 14px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    right: -12,
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: col,
                    opacity: isDark ? 0.07 : 0.04,
                    pointerEvents: 'none',
                  }}
                />
                <Icon path={ICONS[p.icon]} size={18} color={col} style={{ marginBottom: 10 }} />
                <div
                  style={{
                    fontFamily: "'Outfit',sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    color: col,
                    marginBottom: 6,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {p.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Newsreader',serif",
                    fontSize: 12,
                    fontStyle: 'italic',
                    color: T.textSec,
                    lineHeight: 1.55,
                  }}
                >
                  {p.note}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SessionsView() {
  const { T } = useTheme();
  const { sessions, isLoading } = useUserSessions();

  return (
    <div style={{ padding: '40px 40px 64px' }}>
      <PageHeader
        eyebrow="Audit Trail"
        title="Recent Sessions"
        subtitle="All analytical sessions are logged. Conclusions are traceable to their reasoning chain and source data."
      />
      {isLoading ? (
        <div style={{ color: T.textSec, textAlign: 'center', padding: '40px' }}>
          Loading sessions...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessions.length === 0 ? (
            <div style={{ color: T.textSec, textAlign: 'center', padding: '40px' }}>
              No sessions recorded yet.
            </div>
          ) : (
            sessions.map((session, i) => (
              <div
                key={session.id}
                role="button"
                tabIndex={0}
                aria-label={`Session: ${session.topic}`}
                style={{
                  background: T.bgSurface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 200ms ease-in-out,border-color 200ms ease-in-out',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = T.bgElev;
                  (e.currentTarget as HTMLDivElement).style.borderColor = session.pillar + '55';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = T.bgSurface;
                  (e.currentTarget as HTMLDivElement).style.borderColor = T.border;
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: session.pillar,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: T.textPri,
                      marginBottom: 4,
                    }}
                  >
                    {session.appName}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Newsreader',serif",
                      fontSize: 13,
                      color: T.textSec,
                      marginBottom: 4,
                    }}
                  >
                    {session.topic}
                  </div>
                  <div style={{ fontSize: 11, color: T.textSec }}>
                    {session.timeAgo}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatusView() {
  const { T } = useTheme();
  const { components, overallState, isLoading } = usePlatformStatus();

  const healthColors = {
    healthy: T.success,
    warning: T.warning,
    critical: T.error,
  };

  return (
    <div style={{ padding: '40px 40px 64px' }}>
      <PageHeader
        eyebrow="Infrastructure Health"
        title="Platform Status"
        subtitle="Real-time monitoring of core system components and infrastructure."
      />

      {isLoading ? (
        <div style={{ color: T.textSec, textAlign: 'center', padding: '40px' }}>
          Loading platform status...
        </div>
      ) : (
        <>
          {/* Overall Health */}
          <div
            style={{
              background: T.bgSurface,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: 24,
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: T.textSec,
                  marginBottom: 8,
                }}
              >
                System Health
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: healthColors[overallState],
                  textTransform: 'capitalize',
                }}
              >
                {overallState === 'healthy' ? '✓ All Systems Operational' : overallState === 'warning' ? '⚠ Degraded' : '✕ Critical Issues'}
              </div>
            </div>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 4,
                background: `${healthColors[overallState]}15`,
                border: `2px solid ${healthColors[overallState]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}
            >
              {overallState === 'healthy' ? '✓' : overallState === 'warning' ? '⚠' : '!'}
            </div>
          </div>

          {/* Component Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
            {components.map((comp) => {
              const stateColor =
                comp.state === 'operational'
                  ? T.success
                  : comp.state === 'degraded'
                    ? T.warning
                    : T.error;

              return (
                <div
                  key={comp.id}
                  style={{
                    background: T.bgSurface,
                    border: `1px solid ${T.border}`,
                    borderLeft: `3px solid ${stateColor}`,
                    borderRadius: 8,
                    padding: 18,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: stateColor,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: T.textPri,
                      }}
                    >
                      {comp.label}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: T.textSec,
                      lineHeight: 1.5,
                    }}
                  >
                    {comp.note}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: stateColor,
                      marginTop: 8,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {comp.state}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function SettingsView() {
  const { T } = useTheme();
  const { currentUser } = useAuth();
  const { settings, updateSettings, isLoading } = useUserSettings(currentUser?.id || null);
  const [formData, setFormData] = useState({
    fullName: '',
    orgUnit: '',
    classificationLevel: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null);

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        fullName: settings.fullName || '',
        orgUnit: settings.orgUnit || '',
        classificationLevel: settings.classificationLevel || '',
        email: settings.email || '',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await updateSettings({
        fullName: formData.fullName,
        orgUnit: formData.orgUnit,
        classificationLevel: formData.classificationLevel,
        email: formData.email,
      });
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '40px 40px 64px' }}>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        subtitle="Manage your analyst profile and preferences."
      />

      {isLoading ? (
        <div style={{ color: T.textSec }}>Loading settings...</div>
      ) : (
        <div style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { label: 'Display Name', value: 'fullName' },
              { label: 'Organisation Unit', value: 'orgUnit' },
              { label: 'Classification Level', value: 'classificationLevel' },
              { label: 'Notification Email', value: 'email' },
            ].map((field) => (
              <div key={field.value}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: T.textSec,
                    marginBottom: 8,
                  }}
                >
                  {field.label}
                </label>
                <input
                  type="text"
                  value={formData[field.value as keyof typeof formData]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field.value]: e.target.value,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: 13,
                    background: T.inputBg,
                    border: `1px solid ${T.border}`,
                    borderRadius: 6,
                    color: T.textPri,
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
          </div>

          {message && (
            <div
              style={{
                marginTop: 20,
                padding: '12px 16px',
                borderRadius: 6,
                background: message.type === 'success' ? `${T.success}15` : `${T.error}15`,
                color: message.type === 'success' ? T.success : T.error,
                fontSize: 13,
              }}
            >
              {message.text}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              marginTop: 24,
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 500,
              background: T.accent,
              color: T.bgPage,
              border: 'none',
              borderRadius: 6,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              transition: 'all 200ms ease-in-out',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── PORTAL SHELL ──────────────────────────────────────────────────────────
const NAV = [
  { id: 'armory', label: 'The Armory', icon: 'home' },
  { id: 'sessions', label: 'Recent Sessions', icon: 'clock' },
  { id: 'status', label: 'Platform Status', icon: 'activity' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export function PortalApp() {
  const { currentUser, isLoading, isAuthenticated, logout, login, error: authError } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [activeNav, setActiveNav] = useState<'armory' | 'sessions' | 'status' | 'settings'>('armory');
  const [loginAttempt, setLoginAttempt] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const T = isDark ? THEMES.dark : THEMES.light;
  const toggle = () => setIsDark((d) => !d);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginAttempt(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      console.error('Login failed:', err);
      setLoginAttempt(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: T.bgPage,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: T.textSec,
        }}
      >
        Initializing Portal...
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: T.bgPage,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 24,
          color: T.textSec,
          padding: '40px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: T.textPri, marginBottom: 12 }}>
            Analytic Armory Portal
          </h1>
          <p style={{ fontSize: 14, color: T.textSec, marginBottom: 24 }}>
            Decision Intelligence Platform
          </p>

          {authError && (
            <div
              style={{
                background: `${T.error}20`,
                border: `1px solid ${T.error}`,
                borderRadius: 6,
                padding: 12,
                marginBottom: 20,
                fontSize: 13,
                color: T.error,
              }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              disabled={loginAttempt}
              required
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: 12,
                background: T.inputBg,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                color: T.textPri,
                fontSize: 14,
                transition: 'all 200ms ease-in-out',
                boxSizing: 'border-box',
              }}
            />

            <input
              type="password"
              placeholder="Password (optional)"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              disabled={loginAttempt}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: 20,
                background: T.inputBg,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                color: T.textPri,
                fontSize: 14,
                transition: 'all 200ms ease-in-out',
                boxSizing: 'border-box',
              }}
            />

            <button
              type="submit"
              disabled={loginAttempt || !loginEmail}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: T.accent,
                color: '#FFF',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: loginAttempt || !loginEmail ? 'not-allowed' : 'pointer',
                opacity: loginAttempt || !loginEmail ? 0.7 : 1,
                transition: 'all 200ms ease-in-out',
              }}
              onMouseEnter={(e) => {
                if (!loginAttempt && loginEmail) {
                  (e.target as HTMLButtonElement).style.background = T.accentHov;
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = T.accent;
              }}
            >
              {loginAttempt ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const views: Record<string, React.ReactNode> = {
    armory: <ArmoryView />,
    sessions: <SessionsView />,
    status: <StatusView />,
    settings: <SettingsView />,
  };

  return (
    <ThemeCtx.Provider value={{ T, isDark, toggle }}>
      <div style={{ display: 'flex', height: '100vh', background: T.bgPage, color: T.textPri }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 280,
            background: T.sidebarBg,
            borderRight: `1px solid ${T.border}`,
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
          }}
        >
          {/* Logo */}
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="1" stroke={T.logoStroke} strokeWidth="2" />
                <circle cx="12" cy="12" r="5" fill={T.logoFill} stroke={T.logoStroke} strokeWidth="1.5" />
                <circle cx="12" cy="12" r="9" fill="none" stroke={T.logoStroke} strokeWidth="1" opacity="0.3" />
              </svg>
              <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: '0.02em' }}>
                Analytic<br />
                Armory
              </div>
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.38)',
                marginTop: 4,
              }}
            >
              Decision Intelligence
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '20px 12px' }}>
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id as any)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: 8,
                  background: activeNav === item.id ? `${T.accent}20` : 'transparent',
                  color: activeNav === item.id ? T.accent : T.textSec,
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 13,
                  fontWeight: activeNav === item.id ? 600 : 500,
                  transition: 'all 200ms ease-in-out',
                }}
              >
                <Icon path={ICONS[item.icon]} size={16} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Session */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, color: T.textSec, marginBottom: 8 }}>
              LOGGED IN AS
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.textPri,
                marginBottom: 12,
              }}
            >
              {currentUser.fullName}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => toggle()}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: T.bgSurface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon path={ICONS[isDark ? 'sun' : 'moon']} size={14} color={T.accent} />
              </button>
              <button
                onClick={logout}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: T.bgSurface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: T.error,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon path={ICONS.logout} size={14} color={T.error} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <header
            style={{
              background: T.headerBg,
              borderBottom: `1px solid ${T.border}`,
              padding: '0 40px',
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 20,
              position: 'sticky',
              top: 0,
            }}
          >
            {[
              new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              }) + ' LOCAL',
              currentUser.classificationLevel,
            ].map((item, i) => (
              <span
                key={i}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: T.textSec,
                  letterSpacing: '0.08em',
                }}
              >
                {item}
              </span>
            ))}
          </header>

          {/* Content */}
          <main style={{ flex: 1, overflowY: 'auto' }}>
            {views[activeNav]}
          </main>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}

export default PortalApp;
