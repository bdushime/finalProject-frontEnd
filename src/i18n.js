import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// English
import commonEN from "./i18n/locales/en/common.json";
import authEN from "./i18n/locales/en/auth.json";
import adminEN from "./i18n/locales/en/admin.json";
import studentEN from "./i18n/locales/en/student.json";
import itstaffEN from "./i18n/locales/en/itstaff.json";
import securityEN from "./i18n/locales/en/security.json";
import landingEN from "./i18n/locales/en/landing.json";
import gateEN from "./i18n/locales/en/gate.json";

// Kinyarwanda
import commonRW from "./i18n/locales/rw/common.json";
import authRW from "./i18n/locales/rw/auth.json";
import adminRW from "./i18n/locales/rw/admin.json";
import studentRW from "./i18n/locales/rw/student.json";
import itstaffRW from "./i18n/locales/rw/itstaff.json";
import securityRW from "./i18n/locales/rw/security.json";
import landingRW from "./i18n/locales/rw/landing.json";
import gateRW from "./i18n/locales/rw/gate.json";

// French
import commonFR from "./i18n/locales/fr/common.json";
import authFR from "./i18n/locales/fr/auth.json";
import adminFR from "./i18n/locales/fr/admin.json";
import studentFR from "./i18n/locales/fr/student.json";
import itstaffFR from "./i18n/locales/fr/itstaff.json";
import securityFR from "./i18n/locales/fr/security.json";
import landingFR from "./i18n/locales/fr/landing.json";
import gateFR from "./i18n/locales/fr/gate.json";

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
                gate: gateEN,
            },
            rw: {
                common: commonRW,
                auth: authRW,
                admin: adminRW,
                student: studentRW,
                itstaff: itstaffRW,
                security: securityRW,
                landing: landingRW,
                gate: gateRW,
            },
            fr: {
                common: commonFR,
                auth: authFR,
                admin: adminFR,
                student: studentFR,
                itstaff: itstaffFR,
                security: securityFR,
                landing: landingFR,
                gate: gateFR,
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
