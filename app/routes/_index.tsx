import React, { useState, useEffect } from "react";
import { useLoaderData, useActionData, useNavigation, Form } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

// Global UI Components Import - ALWAYS include this entire block
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Input, FloatingLabelInput } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { Progress } from "~/components/ui/progress";
import { Slider } from "~/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { Toggle } from "~/components/ui/toggle";

// Pre-Built Section Components Import (HIGH IMPACT - USE THESE FIRST)
import { NotFoundPage, DefaultNotFoundRoute } from "~/components/sections/not-found-page";

// Utility Components Import
import { GlassmorphicPanel } from "~/components/ui/glassmorphic-panel";
import { GradientBackground } from "~/components/ui/gradient-background";
import { AnimatedIcon } from "~/components/ui/animated-icon";
import { ThemeProvider, ThemeToggle } from "~/components/ui/theme-provider";

// Utility Functions
import { cn } from "~/lib/utils";
import { safeLucideIcon } from "~/components/ui/icon";
import { useIsMobile } from "~/hooks/use-mobile";
import { useToast } from "~/hooks/use-toast";

export const meta = () => {
  return [
    { title: "Bizservo - Register Your US Company Online | EIN, Bank Account & Compliance" },
    { name: "description", content: "Start your US business in minutes. Register LLC/Corporation, get EIN, open bank accounts, and stay compliant. Trusted by 10,000+ global entrepreneurs." },
  ];
};

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  country: string;
  message: string;
}

interface LoaderData {
  services: Array<{
    id: string;
    title: string;
    description: string;
    price: string;
    features: string[];
    popular?: boolean;
  }>;
  testimonials: Array<{
    id: string;
    name: string;
    company: string;
    country: string;
    content: string;
    rating: number;
  }>;
  stats: {
    companiesFormed: string;
    countries: string;
    avgTime: string;
    successRate: string;
  };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Frontend-only data - no backend dependencies
  const services = [
    {
      id: "llc-formation",
      title: "LLC Formation",
      description: "Complete LLC registration with state filing and registered agent service",
      price: "$299",
      features: [
        "State filing fees included",
        "Registered agent (1 year)",
        "Operating agreement template",
        "EIN application assistance",
        "Digital document delivery"
      ]
    },
    {
      id: "corporation-formation",
      title: "Corporation Formation",
      description: "Full corporation setup with bylaws and stock certificates",
      price: "$399",
      features: [
        "Articles of incorporation",
        "Corporate bylaws",
        "Stock certificates",
        "Registered agent (1 year)",
        "EIN application",
        "Corporate kit"
      ],
      popular: true
    },
    {
      id: "ein-service",
      title: "EIN Service",
      description: "Fast EIN (Tax ID) number acquisition for your business",
      price: "$99",
      features: [
        "Same-day processing",
        "IRS direct filing",
        "Digital EIN letter",
        "Tax account setup",
        "Customer support"
      ]
    },
    {
      id: "bank-account",
      title: "US Bank Account",
      description: "Open a US business bank account remotely",
      price: "$199",
      features: [
        "Remote account opening",
        "No US visit required",
        "Multiple bank options",
        "Debit card included",
        "Online banking setup"
      ]
    }
  ];

  const testimonials = [
    {
      id: "1",
      name: "Sarah Chen",
      company: "TechFlow Solutions",
      country: "Singapore",
      content: "Bizservo made it incredibly easy to start my US company. The entire process was completed in just 3 days, and their support team was amazing.",
      rating: 5
    },
    {
      id: "2",
      name: "Marcus Rodriguez",
      company: "Global Ventures LLC",
      country: "Mexico",
      content: "I was skeptical about forming a US company online, but Bizservo exceeded my expectations. Professional, fast, and transparent pricing.",
      rating: 5
    },
    {
      id: "3",
      name: "Priya Patel",
      company: "Innovation Labs",
      country: "India",
      content: "The bank account opening service was a game-changer. I can now accept US payments without any hassle. Highly recommended!",
      rating: 5
    }
  ];

  const stats = {
    companiesFormed: "10,000+",
    countries: "150+",
    avgTime: "3 days",
    successRate: "99.8%"
  };

  return json({ 
    services, 
    testimonials, 
    stats
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "contact") {
      const contactData: ContactFormData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        company: formData.get("company") as string,
        country: formData.get("country") as string,
        message: formData.get("message") as string,
      };

      // Validate required fields
      if (!contactData.name || !contactData.email || !contactData.message) {
        return json({ 
          success: false, 
          error: "Please fill in all required fields" 
        }, { status: 400 });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactData.email)) {
        return json({ 
          success: false, 
          error: "Please enter a valid email address" 
        }, { status: 400 });
      }

      // In a real app, you would send this to your email service
      console.log("Contact form submission:", contactData);

      return json({ 
        success: true, 
        message: "Thank you for your inquiry! We'll get back to you within 24 hours." 
      });
    }

    return json({ 
      success: false, 
      error: "Invalid form submission" 
    }, { status: 400 });

  } catch (error) {
    console.error("Action error:", error);
    return json({ 
      success: false, 
      error: "Something went wrong. Please try again." 
    }, { status: 500 });
  }
};

export default function Index() {
  const { services, testimonials, stats } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  // Show toast notifications for form submissions
  useEffect(() => {
    if (actionData?.success) {
      toast({
        title: "Success!",
        description: actionData.message || "Operation completed successfully!",
        duration: 5000,
      });
      
      setShowContactModal(false);
    } else if (actionData?.error) {
      toast({
        title: "Error",
        description: actionData.error,
        duration: 5000,
      });
    }
  }, [actionData, toast]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    setShowContactModal(true);
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Bizservo</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('hero')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Reviews
              </button>
              <Button 
                variant="ghost"
                onClick={handleLogin}
                className="text-gray-600 hover:text-blue-600"
              >
                Login
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                Get Started
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setShowContactModal(true)}
            >
              {safeLucideIcon('Menu', 'h-6 w-6')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative py-20 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center opacity-5"></div>
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Start Your <span className="text-blue-600">US Company</span> in Minutes
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Register your LLC or Corporation, get EIN, open US bank accounts, and stay compliant. 
              Trusted by 10,000+ entrepreneurs from 150+ countries.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg"
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              >
                Start Your Company
                {safeLucideIcon('ArrowRight', 'ml-2 h-5 w-5')}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => scrollToSection('how-it-works')}
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
              >
                How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.companiesFormed}</div>
                <div className="text-sm text-gray-600">Companies Formed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.countries}</div>
                <div className="text-sm text-gray-600">Countries Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.avgTime}</div>
                <div className="text-sm text-gray-600">Average Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.successRate}</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete US Business Formation Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to start and run your US business, from formation to banking and compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <Card 
                key={service.id} 
                className={cn(
                  "relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2",
                  service.popular && "ring-2 ring-blue-600"
                )}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {service.title}
                  </CardTitle>
                  <div className="text-3xl font-bold text-blue-600 mt-2">
                    {service.price}
                  </div>
                  <CardDescription className="text-gray-600 mt-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {safeLucideIcon('Check', 'h-4 w-4 text-green-500')}
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      setSelectedService(service.id);
                      handleGetStarted();
                    }}
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section (same as services for now) */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No hidden fees. No surprises. Just straightforward pricing for professional business formation services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <Card 
                key={service.id} 
                className={cn(
                  "relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2",
                  service.popular && "ring-2 ring-blue-600"
                )}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-3 py-1">
                      Best Value
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {service.title}
                  </CardTitle>
                  <div className="text-3xl font-bold text-blue-600 mt-2">
                    {service.price}
                  </div>
                  <CardDescription className="text-gray-600 mt-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {safeLucideIcon('Check', 'h-4 w-4 text-green-500')}
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      setSelectedService(service.id);
                      handleGetStarted();
                    }}
                  >
                    Choose Plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes starting your US business simple and fast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Your Service</h3>
              <p className="text-gray-600">
                Select the business formation package that fits your needs. From LLC to Corporation, we have you covered.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Your Application</h3>
              <p className="text-gray-600">
                Fill out our simple online form with your business details. Our experts review everything for accuracy.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Get Your Documents</h3>
              <p className="text-gray-600">
                Receive all your formation documents, EIN, and banking setup within 3-5 business days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Entrepreneurs Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our clients say about their experience with Bizservo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        {safeLucideIcon('Star', 'h-4 w-4 fill-current')}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=300`} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.company}</div>
                      <div className="text-xs text-gray-500">{testimonial.country}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your US Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of entrepreneurs who trust Bizservo for their US business formation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Get Started Today
              {safeLucideIcon('ArrowRight', 'ml-2 h-5 w-5')}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowContactModal(true)}
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              Talk to an Expert
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="text-xl font-bold">Bizservo</span>
              </div>
              <p className="text-gray-400 text-sm">
                Helping entrepreneurs worldwide start and grow their US businesses with confidence.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>LLC Formation</li>
                <li>Corporation Formation</li>
                <li>EIN Service</li>
                <li>US Bank Account</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About Us</li>
                <li>How It Works</li>
                <li>Pricing</li>
                <li>Reviews</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Contact Us</li>
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-gray-800" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2024 Bizservo. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                {safeLucideIcon('Twitter', 'h-4 w-4')}
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                {safeLucideIcon('Linkedin', 'h-4 w-4')}
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                {safeLucideIcon('Mail', 'h-4 w-4')}
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Get Started Today</DialogTitle>
            <DialogDescription>
              Tell us about your business needs and we'll help you get started.
            </DialogDescription>
          </DialogHeader>

          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="contact" />
            {selectedService && (
              <input type="hidden" name="service" value={selectedService} />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="John Doe"
                  required 
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  placeholder="john@example.com"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input 
                  id="company" 
                  name="company" 
                  placeholder="Your Company LLC"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select name="country">
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="singapore">Singapore</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="canada">Canada</SelectItem>
                    <SelectItem value="australia">Australia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea 
                id="message" 
                name="message" 
                placeholder="Tell us about your business goals and how we can help..."
                rows={4}
                required 
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowContactModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    {safeLucideIcon('Loader2', 'mr-2 h-4 w-4 animate-spin')}
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Login to Your Account</DialogTitle>
            <DialogDescription>
              Access your Bizservo dashboard to manage your business formation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="loginEmail">Email</Label>
              <Input 
                id="loginEmail" 
                type="email"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <Label htmlFor="loginPassword">Password</Label>
              <Input 
                id="loginPassword" 
                type="password"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm">Remember me</Label>
              </div>
              <Button variant="link" className="text-sm p-0">
                Forgot password?
              </Button>
            </div>
          </div>

          <DialogFooter className="flex-col space-y-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 text-blue-600"
                onClick={() => {
                  setShowLoginModal(false);
                  setShowContactModal(true);
                }}
              >
                Get started
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
