import { useState, useEffect } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Mail, MessageSquare, Send, CheckCircle, Loader2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BackButton from "./components/BackButton";
import api from "@/utils/api";
import { useTranslation } from "react-i18next";

export default function HelpSupport() {
    const { t } = useTranslation("student");
    const [contactForm, setContactForm] = useState({
        subject: '',
        message: '',
        email: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Auto-fill email from profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                if (res.data.email) {
                    setContactForm(prev => ({ ...prev, email: res.data.email }));
                }
            } catch (err) {
                console.error("Failed to load profile email");
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (field, value) => {
        setContactForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccess(false);

        try {
            await api.post('/tickets', contactForm);
            setSuccess(true);
            setContactForm(prev => ({ ...prev, subject: '', message: '' })); // Keep email filled

            // Reset success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Failed to send ticket:", err);
            alert(t("help.ticketFailed"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <StudentLayout>
            <PageContainer>
                <div className="flex items-center justify-between mb-2">
                    <BackButton to="/student/dashboard" />
                </div>
                <PageHeader
                    title={t("help.title")}
                    subtitle={t("help.findAnswers")}
                    showBack={false}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FAQs */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="flex items-center gap-2 font-bold text-lg text-[#0b1d3a]">
                                    <HelpCircle className="h-5 w-5 text-slate-500" />
                                    {t("help.faqTitle")}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {t("help.browseQuestions")}
                                </p>
                            </div>
                            <div className="p-6">
                                <Accordion type="single" collapsible className="w-full">
                                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                        <AccordionItem key={`FAQ-${num}`} value={`FAQ-${num}`} className="border-slate-100">
                                            <AccordionTrigger className="text-left text-[#0b1d3a] hover:text-[#0b69d4] hover:no-underline py-4 font-medium">
                                                {t(`help.faq${num}Question`)}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-slate-600 leading-relaxed pb-4">
                                                {t(`help.faq${num}Answer`)}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="flex items-center gap-2 font-bold text-lg text-[#0b1d3a]">
                                    <MessageSquare className="h-5 w-5 text-slate-500" />
                                    {t("help.contactSupport")}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {t("help.contactDesc")}
                                </p>
                            </div>
                            <div className="p-6">
                                {success ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle className="w-8 h-8 text-emerald-600" />
                                        </div>
                                        <h4 className="text-lg font-bold text-[#0b1d3a] mb-2">{t("help.messageSent")}</h4>
                                        <p className="text-slate-500 text-sm">
                                            {t("help.ticketReceived")}
                                        </p>
                                        <Button
                                            onClick={() => setSuccess(false)}
                                            variant="outline"
                                            className="mt-6"
                                        >
                                            {t("help.sendAnother")}
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">{t("help.yourEmail")}</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="your.email@auca.ac.rw"
                                                    value={contactForm.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    required
                                                    className="pl-10 bg-white border-slate-200 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-[#0b1d3a]"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject" className="text-sm font-semibold text-slate-700">{t("help.subject")}</Label>
                                            <Input
                                                id="subject"
                                                placeholder="e.g. Projector overheating"
                                                value={contactForm.subject}
                                                onChange={(e) => handleInputChange('subject', e.target.value)}
                                                required
                                                className="bg-white border-slate-200 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-[#0b1d3a]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message" className="text-sm font-semibold text-slate-700">{t("help.message")}</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Describe the issue in detail..."
                                                value={contactForm.message}
                                                onChange={(e) => handleInputChange('message', e.target.value)}
                                                rows={5}
                                                required
                                                className="bg-white border-slate-200 rounded-xl resize-none focus-visible:ring-1 focus-visible:ring-[#0b1d3a]"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-[#0b1d3a] hover:bg-[#126dd5] text-white font-bold rounded-xl h-11 shadow-sm transition-all duration-300 disabled:bg-slate-300 disabled:shadow-none"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("help.sending")}
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" /> {t("help.sendMessage")}
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}

                                <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                    <h4 className="font-bold mb-2 text-[#0b1d3a] text-sm">
                                        {t("help.needImmediate")}
                                    </h4>
                                    <p className="text-xs text-slate-500 mb-1">
                                        {t("help.visitOffice")}
                                    </p>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-medium text-slate-700">+250 788 123 456</p>
                                        <p className="text-xs font-medium text-slate-700">it-support@auca.ac.rw</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PageContainer>
        </StudentLayout>
    );
}