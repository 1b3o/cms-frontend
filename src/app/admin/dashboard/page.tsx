'use client';

import { useAuth } from '@/store/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Welcome Card */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
          <CardDescription>
            Willkommen im CMS Admin-Bereich
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user?.avatar_url || ''} alt={user?.username || 'User'} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.username?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-medium">{user?.full_name || user?.username}</p>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="capitalize">{user?.role}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Info Card */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>Benutzerinformationen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium text-muted-foreground">Benutzername</div>
              <div className="text-sm">{user?.username}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium text-muted-foreground">E-Mail</div>
              <div className="text-sm">{user?.email}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium text-muted-foreground">Name</div>
              <div className="text-sm">{user?.full_name || 'Nicht angegeben'}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium text-muted-foreground">Rolle</div>
              <div className="text-sm capitalize">{user?.role}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="text-sm">
                {user?.active ? (
                  <Badge variant="default">Aktiv</Badge>
                ) : (
                  <Badge variant="destructive">Inaktiv</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>Systemstatus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium text-muted-foreground">Letzte Anmeldung</div>
              <div className="text-sm">Heute, 14:30 Uhr</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium text-muted-foreground">Sitzungsstatus</div>
              <div className="text-sm">
                <Badge className="bg-green-500">Aktiv</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium text-muted-foreground">Account-Typ</div>
              <div className="text-sm capitalize">{user?.role || 'Standard'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}