'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserStories } from '@/lib/firebase-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

interface Story {
  id: string;
  subject: string;
  topic: string;
  videoUrl: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchStories = async () => {
        setLoading(true);
        const { stories, error } = await getUserStories(user.uid);
        if (error) {
          setError(error);
        } else {
          setStories(stories as Story[]);
        }
        setLoading(false);
      };

      fetchStories();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">My Stories</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="container mx-auto p-4">
         <Alert variant="destructive">
           <Terminal className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>
            Failed to load stories: {error}
           </AlertDescription>
         </Alert>
      </div>
    )
  }

  if (!user) {
    return (
       <div className="container mx-auto p-4">
         <Alert>
           <Terminal className="h-4 w-4" />
           <AlertTitle>Authentication Required</AlertTitle>
           <AlertDescription>
            Please log in to see your story history.
           </AlertDescription>
         </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Stories</h1>
      {stories.length === 0 ? (
        <p>You haven't created any stories yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <Card key={story.id}>
              <CardHeader>
                <CardTitle className="capitalize">{story.subject}: {story.topic}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created on: {new Date(story.createdAt.seconds * 1000).toLocaleDateString()}
                </p>
                <a 
                  href={story.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mt-2 inline-block"
                >
                  Watch Video
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 