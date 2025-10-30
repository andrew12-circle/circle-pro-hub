import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Search, Mail } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  points: number | null;
  created_at: string;
}

export function UsersManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleTogglePro = async (userId: string, currentPoints: number | null) => {
    try {
      const newPoints = currentPoints ? 0 : 1000;
      const { error } = await supabase
        .from("profiles")
        .update({ points: newPoints })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Pro status ${newPoints ? 'enabled' : 'disabled'}`,
      });
      loadUsers();
    } catch (error) {
      console.error("Error toggling pro:", error);
      toast({
        title: "Error",
        description: "Failed to toggle Pro status",
        variant: "destructive",
      });
    }
  };

  const handleSendResetLink = (userId: string) => {
    toast({
      title: "Reset Link (Coming Soon)",
      description: "Password reset functionality will be available soon",
    });
    console.info("[Admin] Send reset link for:", userId);
  };

  const filteredUsers = searchEmail
    ? users.filter(u => u.full_name?.toLowerCase().includes(searchEmail.toLowerCase()))
    : users;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Management</CardTitle>
        <CardDescription>Search users, toggle Pro status, and manage accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={loadUsers} disabled={loading}>
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Pro Member</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name || "Unknown"}</TableCell>
                  <TableCell>{user.points || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!user.points && user.points > 0}
                        onCheckedChange={() => handleTogglePro(user.id, user.points)}
                      />
                      <Label className="text-xs">
                        {user.points && user.points > 0 ? "Yes" : "No"}
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendResetLink(user.id)}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Reset Link
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
