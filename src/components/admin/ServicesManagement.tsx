import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import servicesFixture from "../../../fixtures/services.json";
import { Save, FileJson } from "lucide-react";

export function ServicesManagement() {
  const { toast } = useToast();
  const [draftJson, setDraftJson] = useState("");
  const [publishedJson, setPublishedJson] = useState("");

  useEffect(() => {
    // Load from fixtures
    setDraftJson(JSON.stringify(servicesFixture, null, 2));
    setPublishedJson(JSON.stringify(servicesFixture, null, 2));
  }, []);

  const handleSaveDraft = () => {
    try {
      JSON.parse(draftJson); // Validate JSON
      toast({
        title: "Draft Saved",
        description: "Service draft has been saved",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax",
        variant: "destructive",
      });
    }
  };

  const handlePublish = () => {
    try {
      const parsed = JSON.parse(draftJson);
      setPublishedJson(JSON.stringify(parsed, null, 2));
      toast({
        title: "Published",
        description: "Draft has been published to live services",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Cannot publish invalid JSON",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services Management</CardTitle>
        <CardDescription>Edit service cards, pricing, and funnel data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="draft">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>

          <TabsContent value="draft" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileJson className="h-4 w-4" />
              <span>Edit service data in JSON format</span>
            </div>
            <Textarea
              value={draftJson}
              onChange={(e) => setDraftJson(e.target.value)}
              className="font-mono text-xs min-h-[400px]"
              placeholder="Service JSON data..."
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handlePublish} variant="default">
                Publish to Live
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="published" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileJson className="h-4 w-4" />
              <span>Currently published service data (read-only)</span>
            </div>
            <Textarea
              value={publishedJson}
              readOnly
              className="font-mono text-xs min-h-[400px] bg-muted"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
