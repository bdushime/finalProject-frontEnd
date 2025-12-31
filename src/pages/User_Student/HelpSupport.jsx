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
                <div className="flex items-center justify-between mb-2">
                    <BackButton to="/student/dashboard" />
                </div>
                <PageHeader
                    title="Help & Support"
                    subtitle="Find answers to common questions or contact support."
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FAQs */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="flex items-center gap-2 font-bold text-lg text-[#0b1d3a]">
                                    <HelpCircle className="h-5 w-5 text-slate-500" />
                                    Frequently Asked Questions
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Browse common questions and answers.
                                </p>
                            </div>
                            <div className="p-6">
                                <Accordion type="single" collapsible className="w-full">
                                    {faqData.map((faq) => (
                                        <AccordionItem key={faq.id} value={faq.id} className="border-slate-100">
                                            <AccordionTrigger className="text-left text-[#0b1d3a] hover:text-[#0b69d4] hover:no-underline py-4 font-medium">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-slate-600 leading-relaxed pb-4">
                                                {faq.answer}
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
                                    Contact Support
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Send us a message and we'll get back to you.
                                </p>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Your Email</Label>
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
                                        <Label htmlFor="subject" className="text-sm font-semibold text-slate-700">Subject</Label>
                                        <Input
                                            id="subject"
                                            placeholder="What can we help you with?"
                                            value={contactForm.subject}
                                            onChange={(e) => handleInputChange('subject', e.target.value)}
                                            required
                                            className="bg-white border-slate-200 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-[#0b1d3a]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message" className="text-sm font-semibold text-slate-700">Message</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Describe your issue or question..."
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
                                            'Sending...'
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                    <h4 className="font-bold mb-2 text-[#0b1d3a] text-sm">
                                        Need Immediate Help?
                                    </h4>
                                    <p className="text-xs text-slate-500 mb-1">
                                        Visit the IT Department office In Room 108
                                    </p>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-medium text-slate-700">
                                            +250 788 123 456
                                        </p>
                                        <p className="text-xs font-medium text-slate-700">
                                            it-support@auca.ac.rw
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PageContainer>
        </MainLayout>
    );
}
