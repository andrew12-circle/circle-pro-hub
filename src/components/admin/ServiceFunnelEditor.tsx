import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAutosave } from '@/hooks/use-autosave';
import { useToast } from '@/hooks/use-toast';
import { updateServiceFunnel } from '@/data/admin-services';
import { Loader2 } from 'lucide-react';

interface ServiceFunnelEditorProps {
  serviceId: string;
  draft: any | null;
}

export function ServiceFunnelEditor({ serviceId, draft }: ServiceFunnelEditorProps) {
  const { toast } = useToast();
  const [funnelJson, setFunnelJson] = useState(() => 
    JSON.stringify(draft?.funnel || {}, null, 2)
  );
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (draft?.funnel) {
      setFunnelJson(JSON.stringify(draft.funnel, null, 2));
    }
  }, [draft]);

  const { isSaving, lastSaved } = useAutosave({
    data: funnelJson,
    onSave: async (jsonString) => {
      try {
        const parsed = JSON.parse(jsonString);
        await updateServiceFunnel(serviceId, parsed, draft?.card || {}, draft?.pricing || {});
        setIsValid(true);
        toast({
          title: 'Saved',
          description: 'Funnel updated successfully'
        });
      } catch (error) {
        setIsValid(false);
        throw error;
      }
    },
    debounceMs: 1000,
    enabled: isValid
  });

  const handleJsonChange = (value: string) => {
    setFunnelJson(value);
    try {
      JSON.parse(value);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
  };

  let previewData;
  try {
    previewData = JSON.parse(funnelJson);
  } catch {
    previewData = null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Funnel Editor</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {!isSaving && lastSaved && (
              <span>Saved {Math.round((Date.now() - lastSaved.getTime()) / 1000)}s ago</span>
            )}
            {!isValid && (
              <span className="text-destructive">Invalid JSON</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="editor" className="flex-1">Editor</TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-4">
            <Textarea
              value={funnelJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="font-mono text-sm min-h-[500px]"
              placeholder='{"packages": [], "faq": [], "media": {}, "compliance": {}}'
            />
            <p className="text-sm text-muted-foreground">
              Edit the JSON structure. Changes are automatically saved after 1 second of inactivity.
            </p>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="border rounded-md p-4 min-h-[500px] bg-muted/50">
              {previewData ? (
                <pre className="text-sm font-mono overflow-auto">
                  {JSON.stringify(previewData, null, 2)}
                </pre>
              ) : (
                <p className="text-muted-foreground">Invalid JSON - cannot preview</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
