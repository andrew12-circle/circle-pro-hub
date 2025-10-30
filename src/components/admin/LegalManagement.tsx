import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, FileText } from "lucide-react";

export function LegalManagement() {
  const { toast } = useToast();
  const [legalJson, setLegalJson] = useState("");

  useEffect(() => {
    fetch('/fixtures/legal.json')
      .then(res => res.json())
      .then(data => setLegalJson(JSON.stringify(data, null, 2)))
      .catch(console.error);
  }, []);

  const handleSave = () => {
    try {
      JSON.parse(legalJson); // Validate JSON
      toast({
        title: "Legal Content Saved",
        description: "Legal documents have been updated",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legal & Footer Content</CardTitle>
        <CardDescription>Edit legal documents and footer content in JSON format</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="editor">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Edit legal content in JSON format</span>
            </div>
            <Textarea
              value={legalJson}
              onChange={(e) => setLegalJson(e.target.value)}
              className="font-mono text-xs min-h-[400px]"
              placeholder="Legal JSON data..."
            />
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Legal Content
            </Button>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <h3>Preview</h3>
              <p className="text-muted-foreground">
                Legal content preview will render here based on the JSON structure
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                {legalJson}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
