import { useState } from "react";
import { Home, BookOpen, MessageSquare, AlertCircle, Settings, Plus, ChevronDown, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Account", url: "/account", icon: Settings },
];

const mockSubjects = [
  {
    id: "1",
    name: "Mathematics",
    topics: ["Calculus", "Linear Algebra", "Statistics"],
  },
  {
    id: "2",
    name: "Physics",
    topics: ["Mechanics", "Electromagnetism", "Quantum"],
  },
  {
    id: "3",
    name: "Computer Science",
    topics: ["Algorithms", "Data Structures", "Machine Learning"],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>(["1"]);

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!isCollapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              StudyBar
            </h1>
          )}
          <SidebarTrigger className="ml-auto">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <SidebarGroup>
            <div className="flex items-center justify-between px-3 pb-2">
              <SidebarGroupLabel>Subjects</SidebarGroupLabel>
              <Button size="icon" variant="ghost" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {mockSubjects.map((subject) => (
                  <Collapsible
                    key={subject.id}
                    open={expandedSubjects.includes(subject.id)}
                    onOpenChange={() => toggleSubject(subject.id)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full">
                          <BookOpen className="h-5 w-5" />
                          <span className="flex-1 text-left">{subject.name}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expandedSubjects.includes(subject.id) && "rotate-180"
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-8 space-y-1">
                        {subject.topics.map((topic) => (
                          <NavLink
                            key={topic}
                            to={`/subject/${subject.id}/topic/${topic.toLowerCase().replace(" ", "-")}`}
                            className={({ isActive }) =>
                              cn(
                                "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent",
                                isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              )
                            }
                          >
                            {topic}
                          </NavLink>
                        ))}
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!isCollapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/flashcards"
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )
                      }
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>Flashcards</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/tutorgpt"
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )
                      }
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span>TutorGPT</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/error-log"
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )
                      }
                    >
                      <AlertCircle className="h-5 w-5" />
                      <span>Error Log</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
