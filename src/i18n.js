import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// English
import commonEN from "./locales/en/common.json";
import authEN from "./locales/en/auth.json";
import adminEN from "./locales/en/admin.json";
import studentEN from "./locales/en/student.json";
import itstaffEN from "./locales/en/itstaff.json";
import securityEN from "./locales/en/security.json";
import landingEN from "./locales/en/landing.json";

// Kinyarwanda
import commonRW from "./locales/rw/common.json";
import authRW from "./locales/rw/auth.json";
import adminRW from "./locales/rw/admin.json";
import studentRW from "./locales/rw/student.json";
import itstaffRW from "./locales/rw/itstaff.json";
import securityRW from "./locales/rw/security.json";
import landingRW from "./locales/rw/landing.json";

// French
import commonFR from "./locales/fr/common.json";
import authFR from "./locales/fr/auth.json";
import adminFR from "./locales/fr/admin.json";
import studentFR from "./locales/fr/student.json";
import itstaffFR from "./locales/fr/itstaff.json";
import securityFR from "./locales/fr/security.json";
import landingFR from "./locales/fr/landing.json";

const savedLanguage = localStorage.getItem("i18n_language") || "en";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                common: commonEN,
                auth: authEN,
                admin: adminEN,
                student: studentEN,
                itstaff: itstaffEN,
                security: securityEN,
                landing: landingEN,
            },
            rw: {
                common: commonRW,
                auth: authRW,
                admin: adminRW,
                student: studentRW,
                itstaff: itstaffRW,
                security: securityRW,
                landing: landingRW,
            },
            fr: {
                common: commonFR,
                auth: authFR,
                admin: adminFR,
                student: studentFR,
                itstaff: itstaffFR,
                security: securityFR,
                landing: landingFR,
            },
        },
        lng: savedLanguage,
        fallbackLng: "en",
        defaultNS: "common",
        interpolation: {
            escapeValue: false,
        },
    });

// Persist language changes
i18n.on("languageChanged", (lng) => {
    localStorage.setItem("i18n_language", lng);
});

export default i18n;
