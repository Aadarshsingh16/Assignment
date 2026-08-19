import type { AnalyzedPost } from '../utils/sentiment';
import { PostCard } from './PostCard';

type PostListProps = {
  posts: AnalyzedPost[];
};

export function PostList({ posts }: PostListProps) {
  return (
    <section className="post-list-section">
      <h2 className="post-list-title">
        Hot Posts
        <span className="post-list-count">{posts.length}</span>
      </h2>
      <div className="post-list">
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </section>
  );
}
