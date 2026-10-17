import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Minus, Plus } from "iconoir-react";
import {
  LANGUAGES,
  TRACKS,
  type Level,
  type Profile,
  type Role,
} from "@contracts/types";
import { useI18n, type TKey } from "@/i18n";
import { useAppState } from "@/state";
import { Choice, PageHeader, Progress } from "@/components/ismos";

const MIN_HOURS = 2;
const MAX_HOURS = 42;
const TOTAL_STEPS = 5;

export default function Quiz() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { profile, setProfile } = useAppState();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | null>(profile?.role ?? null);
  const [level, setLevel] = useState<Level | null>(profile?.level ?? null);
  const [langs, setLangs] = useState<string[]>(profile?.languages ?? []);
  const [tracks, setTracks] = useState<string[]>(profile?.tracks ?? []);
  const [hours, setHours] = useState<number>(profile?.hoursPerWeek ?? 28);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  const clampHours = (h: number) => Math.min(MAX_HOURS, Math.max(MIN_HOURS, h));

  const canNext =
    step === 0
      ? role !== null
      : step === 1
        ? level !== null
        : step === 2
          ? langs.length > 0
          : step === 3
            ? tracks.length > 0
            : true;

  const finish = () => {
    if (!role || !level) return;
    const p: Profile = {
      role,
      level,
      languages: langs,
      tracks,
      hoursPerWeek: hours,
    };
    setProfile(p);
    navigate("/projects");
  };

  const steps: React.ReactNode[] = [
    <div className="grid md:grid-cols-2 gap-12">
      <Choice
        type="radio"
        name="role"
        checked={role === "developer"}
        onChange={() => setRole("developer")}
        title={t("quiz.role.dev")}
        desc={t("quiz.role.dev.d")}
      />
      <Choice
        type="radio"
        name="role"
        checked={role === "researcher"}
        onChange={() => setRole("researcher")}
        title={t("quiz.role.research")}
        desc={t("quiz.role.research.d")}
      />
    </div>,
    <div className="grid lg:grid-cols-3 gap-12">
      {(["beginner", "intermediate", "advanced"] as Level[]).map(l => (
        <Choice
          key={l}
          type="radio"
          name="level"
          checked={level === l}
          onChange={() => setLevel(l)}
          title={t(`quiz.level.${l}` as TKey)}
          desc={t(`quiz.level.${l}.d` as TKey)}
        />
      ))}
    </div>,
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
      {LANGUAGES.map(l => (
        <Choice
          key={l}
          type="checkbox"
          name="languages"
          checked={langs.includes(l)}
          onChange={() => toggle(langs, l, setLangs)}
          title={l}
        />
      ))}
    </div>,
    <div className="grid md:grid-cols-2 gap-12">
      {TRACKS.map(tr => (
        <Choice
          key={tr}
          type="checkbox"
          name="tracks"
          checked={tracks.includes(tr)}
          onChange={() => toggle(tracks, tr, setTracks)}
          title={t(`track.${tr}` as TKey)}
        />
      ))}
    </div>,
    <div className="flex flex-col gap-16">
      <div className="flex items-center gap-16">
        <button
          type="button"
          className="ism-btn ism-btn--secondary"
          onClick={() => setHours(h => clampHours(h - 1))}
          aria-label={t("quiz.hours.less")}
        >
          <Minus width={20} height={20} aria-hidden="true" />
        </button>
        <input
          type="range"
          min={MIN_HOURS}
          max={MAX_HOURS}
          value={hours}
          onChange={e => setHours(Number(e.target.value))}
          className="app-slider"
          aria-label={t("quiz.hours")}
        />
        <button
          type="button"
          className="ism-btn ism-btn--secondary"
          onClick={() => setHours(h => clampHours(h + 1))}
          aria-label={t("quiz.hours.more")}
        >
          <Plus width={20} height={20} aria-hidden="true" />
        </button>
      </div>
      <p className="ism-t-figure text-text-heading m-0" aria-live="polite">
        {hours} {t("quiz.hours.unit")}
      </p>
      <p className="ism-t-body-small text-text-muted m-0">
        {t("quiz.hours.hint")}
      </p>
    </div>,
  ];

  const stepTitles: TKey[] = [
    "quiz.role",
    "quiz.level",
    "quiz.langs",
    "quiz.tracks",
    "quiz.hours",
  ];

  return (
    <div className="app-container py-64">
      <div className="max-w-reading">
        <PageHeader label={t("quiz.eyebrow")} title={t("quiz.title")}>
          <Progress
            label={t("quiz.step")}
            done={step + 1}
            total={TOTAL_STEPS}
            countLabel={t("quiz.stepOf")
              .replace("{n}", String(step + 1))
              .replace("{total}", String(TOTAL_STEPS))}
          />
        </PageHeader>
      </div>

      <fieldset className="border-0 m-0 p-0">
        <legend className="ism-t-h3 text-text-heading mb-24">
          {t(stepTitles[step])}
        </legend>
        {steps[step]}
      </fieldset>

      <div className="mt-48 flex flex-wrap justify-between gap-16">
        <button
          type="button"
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="app-btn-tertiary"
        >
          <ArrowLeft width={20} height={20} aria-hidden="true" />
          {t("quiz.back")}
        </button>
        {step < TOTAL_STEPS - 1 ? (
          <button
            type="button"
            onClick={() => canNext && setStep(s => s + 1)}
            disabled={!canNext}
            className="ism-btn"
          >
            {t("quiz.next")}
            <ArrowRight width={20} height={20} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" onClick={finish} className="ism-btn">
            {t("quiz.finish")}
            <ArrowRight width={20} height={20} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
