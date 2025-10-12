import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { CoPartnerFormSchema, type CoPartnerForm } from "../../../contracts/forms/vendor-intake";
import { queue } from "@/adapters/queue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const ApplyCoPartner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CoPartnerForm>({
    resolver: zodResolver(CoPartnerFormSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      contactEmail: "",
      agentCount: 0,
      dealsPerYear: 0,
      serviceInterests: [],
      copayContribution: 0,
    },
  });

  const onSubmit = async (data: CoPartnerForm) => {
    setIsSubmitting(true);
    try {
      await queue.enqueue({
        type: "partner_intake",
        payload: {
          formType: "copartner",
          data,
        },
      });

      toast({
        title: "Application Submitted",
        description: "We'll review your co-pay program application and contact you soon.",
      });

      navigate("/partners/start");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate("/partners/start")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partner Options
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Co-Pay Program Application</CardTitle>
              <CardDescription>
                Apply to offer co-pay benefits to your agents through Circle Pro Hub
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your brokerage name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@brokerage.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="agentCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Agents</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="50"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dealsPerYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deals Per Year</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="200"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>Total deals closed annually</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="serviceInterests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Interests</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter services separated by commas"
                            value={field.value?.join(", ") || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          e.g., Home Staging, Photography, Inspection Services
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="copayContribution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Co-Pay Contribution (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="50"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Percentage of service cost your company will contribute
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate("/partners/start")}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApplyCoPartner;
