import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Mail, MessageSquare, Send } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BackButton from "./components/BackButton";
import { faqData } from "./data/mockData";

export default function HelpSupport() {
    const [contactForm, setContactForm] = useState({
        subject: '',
        message: '',
        email: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field, value) => {
        setContactForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            alert('Your message has been sent! We will get back to you soon.');
            setContactForm({ subject: '', message: '', email: '' });
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <MainLayout>
            <PageContainer>
                <BackButton to="/student/dashboard" />
                <PageHeader
                    title="Help & Support"
                    subtitle="Find answers to common questions or contact support"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* FAQs */}
                    <div className="lg:col-span-2">
                        <Card className="border border-slate-200 rounded-2xl shadow-[0_16px_38px_-22px_rgba(8,47,73,0.25)] bg-white/95 hover:border-sky-200 hover:shadow-[0_22px_42px_-22px_rgba(8,47,73,0.35)] transition-all duration-300">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 font-bold text-[#0b1d3a]">
                                    <HelpCircle className="h-5 w-5 text-slate-600" />
                                    Frequently Asked Questions
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Browse common questions and answers
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Accordion type="single" collapsible className="w-full">
                                    {faqData.map((faq) => (
                                        <AccordionItem key={faq.id} value={faq.id}>
                                            <AccordionTrigger className="text-left text-[#0b1d3a] hover:text-[#0b69d4]">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-slate-700">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <Card className="border border-slate-200 rounded-2xl shadow-[0_16px_38px_-22px_rgba(8,47,73,0.25)] bg-white/95 hover:border-sky-200 hover:shadow-[0_22px_42px_-22px_rgba(8,47,73,0.35)] transition-all duration-300">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 font-bold text-[#0b1d3a]">
                                    <MessageSquare className="h-5 w-5 text-slate-600" />
                                    Contact Support
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Send us a message and we'll get back to you
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Your Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="your.email@auca.ac.rw"
                                                value={contactForm.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                required
                                                className="pl-10 bg-white border border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-300 text-[#0b1d3a] placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            placeholder="What can we help you with?"
                                            value={contactForm.subject}
                                            onChange={(e) => handleInputChange('subject', e.target.value)}
                                            required
                                            className="bg-white border border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-300 text-[#0b1d3a] placeholder:text-slate-400"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Describe your issue or question..."
                                            value={contactForm.message}
                                            onChange={(e) => handleInputChange('message', e.target.value)}
                                            rows={6}
                                            required
                                            className="bg-white border border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-300 text-[#0b1d3a] placeholder:text-slate-400"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-[#0b69d4] hover:bg-[#0f7de5] text-white font-bold rounded-xl shadow-sm shadow-sky-200/60 transition-all duration-300 disabled:bg-slate-300 disabled:shadow-none"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            'Sending...'
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                    <h4 className="font-bold mb-2 text-[#0b1d3a]">
                                        Need Immediate Help?
                                    </h4>
                                    <p className="text-sm text-slate-700">
                                        Visit the IT Department office at Building A, Room 101
                                    </p>
                                    <p className="text-sm text-slate-700 mt-1">
                                        Phone: +250 788 123 456
                                    </p>
                                    <p className="text-sm text-slate-700">
                                        Email: it-support@auca.ac.rw
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Quick Links */}
                <Card className="mt-6 border border-slate-200 rounded-2xl shadow-[0_16px_38px_-22px_rgba(8,47,73,0.25)] bg-white/95 hover:border-sky-200 hover:shadow-[0_22px_42px_-22px_rgba(8,47,73,0.35)] transition-all duration-300">
                    <CardHeader className="pb-3">
                        <CardTitle className="font-bold text-[#0b1d3a]">Quick Links</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="justify-start h-auto p-4 rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a] transition-all duration-300 hover:-translate-y-0.5">
                                <div className="p-2 rounded-lg bg-sky-100 border border-sky-200 mr-3">
                                    <HelpCircle className="h-5 w-5 text-[#0b1d3a]" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-[#0b1d3a]">User Guide</div>
                                    <div className="text-xs text-slate-600">Learn how to use the system</div>
                                </div>
                            </Button>
                            <Button variant="outline" className="justify-start h-auto p-4 rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a] transition-all duration-300 hover:-translate-y-0.5">
                                <div className="p-2 rounded-lg bg-sky-100 border border-sky-200 mr-3">
                                    <MessageSquare className="h-5 w-5 text-[#0b1d3a]" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-[#0b1d3a]">Report Issue</div>
                                    <div className="text-xs text-slate-600">Report a bug or problem</div>
                                </div>
                            </Button>
                            <Button variant="outline" className="justify-start h-auto p-4 rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a] transition-all duration-300 hover:-translate-y-0.5">
                                <div className="p-2 rounded-lg bg-sky-100 border border-sky-200 mr-3">
                                    <Mail className="h-5 w-5 text-[#0b1d3a]" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-[#0b1d3a]">Email Support</div>
                                    <div className="text-xs text-slate-600">it-support@auca.ac.rw</div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PageContainer>
        </MainLayout>
    );
}

