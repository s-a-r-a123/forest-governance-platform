"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Search, Menu, Globe, Users, Database, MapPin } from "lucide-react";

import FRAAtlasExplorer from "@/components/FRAAtlasExplorer";
import StakeholderDashboard from "@/components/StakeholderDashboard";
import DataIngestManager from "@/components/DataIngestManager";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("explorer");
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("en");
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Global Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Mobile Navigation Toggle */}
            <Sheet open={navigationOpen} onOpenChange={setNavigationOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="py-6">
                  <h2 className="text-lg font-semibold mb-4">Navigation</h2>
                  <nav className="space-y-2">
                    <Button
                      variant={activeSection === "explorer" ? "default" : "ghost"}
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        setActiveSection("explorer");
                        setNavigationOpen(false);
                      }}
                    >
                      <MapPin className="h-4 w-4" />
                      FRA Atlas Explorer
                    </Button>
                    <Button
                      variant={activeSection === "stakeholder" ? "default" : "ghost"}
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        setActiveSection("stakeholder");
                        setNavigationOpen(false);
                      }}
                    >
                      <Users className="h-4 w-4" />
                      Stakeholder Dashboard
                    </Button>
                    <Button
                      variant={activeSection === "data" ? "default" : "ghost"}
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        setActiveSection("data");
                        setNavigationOpen(false);
                      }}
                    >
                      <Database className="h-4 w-4" />
                      Data Ingest Manager
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">FRA Atlas</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Forest Rights Decision Support System
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search parcels, claims, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-20 h-8">
                <Globe className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="hi">HI</SelectItem>
                <SelectItem value="mr">MR</SelectItem>
              </SelectContent>
            </Select>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* User Avatar */}
            <Avatar className="h-8 w-8">
              <AvatarImage src="/api/placeholder/32/32" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Navigation Sidebar */}
        <aside className="w-64 border-r bg-card/30 hidden lg:block">
          <div className="p-4 space-y-2">
            <Button
              variant={activeSection === "explorer" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActiveSection("explorer")}
            >
              <MapPin className="h-4 w-4" />
              FRA Atlas Explorer
            </Button>
            <Button
              variant={activeSection === "stakeholder" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActiveSection("stakeholder")}
            >
              <Users className="h-4 w-4" />
              Stakeholder Dashboard
            </Button>
            <Button
              variant={activeSection === "data" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActiveSection("data")}
            >
              <Database className="h-4 w-4" />
              Data Ingest Manager
            </Button>
          </div>

          {/* Quick Stats Card */}
          <div className="p-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Active Claims</span>
                  <span className="font-medium">247</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Pending Review</span>
                  <span className="font-medium">18</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Data Sets</span>
                  <span className="font-medium">12</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {/* Mobile Quick Navigation Tabs */}
          <div className="lg:hidden border-b bg-card/50">
            <Tabs value={activeSection} onValueChange={setActiveSection}>
              <TabsList className="w-full justify-start rounded-none h-12 bg-transparent">
                <TabsTrigger value="explorer" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Explorer</span>
                </TabsTrigger>
                <TabsTrigger value="stakeholder" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="data" className="gap-2">
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Data</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Dynamic Content Container */}
          <div className="h-full overflow-hidden">
            {activeSection === "explorer" && <FRAAtlasExplorer />}
            {activeSection === "stakeholder" && <StakeholderDashboard />}
            {activeSection === "data" && <DataIngestManager />}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/30 px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>© 2024 FRA Atlas System</span>
            <span>•</span>
            <button className="hover:text-foreground transition-colors">
              Privacy Policy
            </button>
            <span>•</span>
            <button className="hover:text-foreground transition-colors">
              Terms of Service
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span>Data provided by Ministry of Environment & Forest</span>
            <Badge variant="outline" className="text-xs">
              v2.1.0
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}