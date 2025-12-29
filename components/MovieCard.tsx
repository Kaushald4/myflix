import { Meta } from "@/lib/api";
import { Play, Star, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface MovieCardProps {
  movie: Meta;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/${movie.type}/${movie.id}`} className="block h-full">
      <div className="group relative aspect-[2/3] w-full rounded-md overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10">
        <Image
          src={movie.poster}
          alt={movie.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="flex gap-2 mb-2">
            <button
              onClick={(e) => {
                e.preventDefault();
              }}
              className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/80 transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
            <button className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors">
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {movie.imdbRating && (
              <div className="flex items-center gap-1 text-green-400">
                <Star className="w-3 h-3 fill-current" />
                <span>{movie.imdbRating}</span>
              </div>
            )}
            {movie.year && (
              <span className="text-muted-foreground">{movie.year}</span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {movie.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          {movie.year && <span>{movie.year}</span>}
          {movie.imdbRating && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1 text-green-400">
                <Star className="w-3 h-3 fill-current" />
                <span>{movie.imdbRating}</span>
              </div>
            </>
          )}
        </div>
        {movie.genre && movie.genre.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {movie.genre.slice(0, 2).map((g) => (
              <Badge
                key={g}
                variant="secondary"
                className="bg-white/10 text-foreground border-white/10 text-xs px-2 py-0"
              >
                {g}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
