import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string;
  created_at: string;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data as Notification[]);
  };

  useEffect(() => {
    fetchNotifications();

    if (!user) return;
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const typeIcon: Record<string, string> = {
    approval: "✅",
    term: "📖",
    course: "📚",
    meeting: "📅",
    info: "ℹ️",
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] bg-destructive text-destructive-foreground border-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-semibold text-sm">
            {lang === "en" ? "Notifications" : "Notifications"}
          </h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1"
              onClick={markAllRead}
            >
              {lang === "en" ? "Mark all read" : "Tout marquer lu"}
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[300px]">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {lang === "en" ? "No notifications" : "Aucune notification"}
            </p>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 text-sm ${!n.is_read ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">
                      {typeIcon[n.type] || "ℹ️"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium text-xs ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleDateString(
                          lang === "fr" ? "fr-FR" : "en-US",
                          { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
