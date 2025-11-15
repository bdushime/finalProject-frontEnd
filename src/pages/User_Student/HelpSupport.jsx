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
                <PageHeader
                    title="Help & Support"
                    subtitle="Find answers to common questions or contact support"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* FAQs */}
                    <div className="lg:col-span-2">
                        <Card className="border-gray-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <HelpCircle className="h-5 w-5" />
                                    Frequently Asked Questions
                                </CardTitle>
                                <CardDescription>
                                    Browse common questions and answers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {faqData.map((faq) => (
                                        <AccordionItem key={faq.id} value={faq.id}>
                                            <AccordionTrigger className="text-left">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-gray-600 dark:text-gray-400">
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
                        <Card className="border-gray-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Contact Support
                                </CardTitle>
                                <CardDescription>
                                    Send us a message and we'll get back to you
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Your Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="your.email@auca.ac.rw"
                                                value={contactForm.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                required
                                                className="pl-10"
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
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-[#343264] hover:bg-[#2a2752] text-white"
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

                                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                                        Need Immediate Help?
                                    </h4>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        Visit the IT Department office at Building A, Room 101
                                    </p>
                                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                                        Phone: +250 788 123 456
                                    </p>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        Email: it-support@auca.ac.rw
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Quick Links */}
                <Card className="mt-6 border-gray-300">
                    <CardHeader>
                        <CardTitle>Quick Links</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="justify-start h-auto p-4">
                                <HelpCircle className="h-5 w-5 mr-3" />
                                <div className="text-left">
                                    <div className="font-semibold">User Guide</div>
                                    <div className="text-xs text-gray-500">Learn how to use the system</div>
                                </div>
                            </Button>
                            <Button variant="outline" className="justify-start h-auto p-4">
                                <MessageSquare className="h-5 w-5 mr-3" />
                                <div className="text-left">
                                    <div className="font-semibold">Report Issue</div>
                                    <div className="text-xs text-gray-500">Report a bug or problem</div>
                                </div>
                            </Button>
                            <Button variant="outline" className="justify-start h-auto p-4">
                                <Mail className="h-5 w-5 mr-3" />
                                <div className="text-left">
                                    <div className="font-semibold">Email Support</div>
                                    <div className="text-xs text-gray-500">it-support@auca.ac.rw</div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PageContainer>
        </MainLayout>
    );
}

