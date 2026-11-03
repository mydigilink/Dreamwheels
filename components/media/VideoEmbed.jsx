export function toEmbed(url = '') {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}` };
  if (url) return { kind: 'video', src: url };
  return null;
}

export default function VideoEmbed({ url, title }) {
  const e = toEmbed(url);
  if (!e) return null;
  return (
    <div className="video">
      {e.kind === 'iframe' ? (
        <iframe src={e.src} title={title || 'Video'} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
      ) : (
        <video src={e.src} controls preload="metadata" playsInline />
      )}
    </div>
  );
}
