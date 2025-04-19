import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Stethoscope, SearchCode } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/hooks/use-toast";
import { 
  type SymptomCheckerData, 
  symptomCheckerSchema,
  type Symptom
} from "@shared/schema";

export function SymptomChecker() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Get available symptoms
  const { data: symptoms = [] } = useQuery<Symptom[]>({
    queryKey: ['/api/symptoms'],
  });

  // Convert symptoms to options for MultiSelect
  const symptomOptions = symptoms.map(symptom => ({
    value: symptom.name,
    label: symptom.name
  }));

  // Form definition
  const form = useForm<SymptomCheckerData>({
    resolver: zodResolver(symptomCheckerSchema),
    defaultValues: {
      mainSymptom: "",
      additionalSymptoms: [],
      duration: "",
      severity: 5,
      details: ""
    }
  });

  // Generate prescription mutation
  const generatePrescription = useMutation({
    mutationFn: async (data: SymptomCheckerData) => {
      const res = await apiRequest('POST', '/api/prescriptions/generate', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
      setSubmitting(false);
      toast({
        title: "Symptoms analyzed successfully",
        description: "Scroll down to see your new prescription.",
      });
      form.reset();
    },
    onError: (error) => {
      setSubmitting(false);
      toast({
        variant: "destructive",
        title: "Error analyzing symptoms",
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  });

  // Form submission handler
  const onSubmit = async (data: SymptomCheckerData) => {
    setSubmitting(true);
    generatePrescription.mutate(data);
  };

  return (
    <Card className="mb-8">
      <CardHeader className="bg-primary-50 border-b border-gray-200">
        <div className="flex items-center">
          <Stethoscope className="text-primary mr-2 h-5 w-5" />
          <CardTitle className="text-lg">Symptom Checker</CardTitle>
        </div>
        <CardDescription>
          Describe your symptoms to get AI-powered prescription recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="mainSymptom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Symptom</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={submitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your main symptom" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {symptoms.map((symptom) => (
                        <SelectItem key={symptom.id} value={symptom.name}>
                          {symptom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalSymptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Symptoms</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={symptomOptions}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Type to add more symptoms"
                      disabled={submitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={submitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="How long have you experienced symptoms?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Less than 24 hours">Less than 24 hours</SelectItem>
                      <SelectItem value="1-3 days">1-3 days</SelectItem>
                      <SelectItem value="4-7 days">4-7 days</SelectItem>
                      <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                      <SelectItem value="More than 2 weeks">More than 2 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Mild</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        disabled={submitting}
                        {...field}
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      />
                      <span className="text-xs text-gray-500">Severe</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe any other details about your symptoms"
                      className="resize-none"
                      disabled={submitting}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={submitting}
            >
              <SearchCode className="mr-2 h-4 w-4" />
              {submitting ? "Analyzing Symptoms..." : "Analyze Symptoms"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
