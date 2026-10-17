import { Link } from "react-router";
import { useI18n } from "@/i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="mx-auto max-w-reading px-16 md:px-32 py-96 flex flex-col gap-24">
      <span className="ism-bar" />
      <p className="ism-label">404</p>
      <h1 className="ism-t-h1 text-text-heading m-0">{t("notFound.title")}</h1>
      <p className="ism-t-lead m-0">{t("notFound.body")}</p>
      <div>
        <Link to="/" className="ism-btn">
          {t("notFound.cta")}
        </Link>
      </div>
    </main>
  );
}
