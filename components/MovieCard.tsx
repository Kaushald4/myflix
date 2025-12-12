import { Meta } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Play, Star, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MovieCardProps {
  movie: Meta;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/${movie.type}/${movie.id}`} className="block h-full">
      <div className="group relative h-60 sm:h-100 w-full overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:z-10">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <Image
            src={movie.poster}
            alt={movie.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

          {/* Gradient Blur Effect on Hover */}
          <div
            className="absolute inset-0 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, black 0%, transparent 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-100 transition-all duration-300">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors duration-300 neon-text-hover">
              {movie.name}
            </h3>

            <div className="flex items-center gap-2 mb-2 text-sm text-gray-300">
              {movie.year && <span>{movie.year}</span>}
              {movie.imdbRating && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{movie.imdbRating}</span>
                </div>
              )}
              {movie.runtime && <span>{movie.runtime}</span>}
            </div>

            {/* Expanded Content on Hover */}
            <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
              <p className="text-sm text-gray-400 line-clamp-3 mb-3">
                {movie.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genre?.slice(0, 3).map((g) => (
                  <Badge
                    key={g}
                    variant="secondary"
                    className="bg-white/10 hover:bg-primary/20 text-xs backdrop-blur-sm border-white/5"
                  >
                    {g}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                  <Play className="w-4 h-4 fill-current" />
                  Watch Now
                </button>
                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors">
                  <Info className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Glass Effect Border */}
        <div className="absolute inset-0 rounded-xl border border-white/10 pointer-events-none group-hover:border-primary/50 transition-colors duration-300" />
      </div>
    </Link>
  );
}
