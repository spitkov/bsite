'use client';

import { useEffect, useState } from 'react';

function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
    };
    
    // Only add listener on desktop
    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', updateCursor);
      return () => window.removeEventListener('mousemove', updateCursor);
    }
  }, []);

  // Don't render on mobile
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return <div className="cursor-dot" style={{ left: position.x, top: position.y }} />;
}

function GridBackground() {
  useEffect(() => {
    let dots: HTMLElement[] = [];
    const SPACING = window.innerWidth <= 768 ? 30 : 40;
    const DOT_SIZE = window.innerWidth <= 768 ? 2 : 3;
    
    const createDots = () => {
      const fragment = document.createDocumentFragment();
      const container = document.createElement('div');
      container.className = 'fixed inset-0 pointer-events-none';
      
      const cols = Math.ceil(window.innerWidth / SPACING);
      const rows = Math.ceil(window.innerHeight / SPACING);
      
      for(let i = 0; i < rows; i++) {
        for(let j = 0; j < cols; j++) {
          const dot = document.createElement('div');
          dot.className = 'dot';
          const x = j * SPACING + SPACING/2;
          const y = i * SPACING + SPACING/2;
          dot.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            width: ${DOT_SIZE}px;
            height: ${DOT_SIZE}px;
          `;
          fragment.appendChild(dot);
          dots.push(dot);
        }
      }
      
      container.appendChild(fragment);
      document.body.appendChild(container);
    };

    createDots();
    
    return () => {
      dots.forEach(dot => dot.remove());
      dots = [];
    };
  }, []);

  return <div className="fixed inset-0 bg-zinc-900" />;
}

function Profile() {
  const [profileData, setProfileData] = useState<any>(null);
  const socials = [
    { name: 'Instagram', username: 'brokensamsaj5', url: 'https://instagram.com/brokensamsaj5' },
    { name: 'TikTok', username: 'brokensamsaj5', url: 'https://tiktok.com/@brokensamsaj5' },
    { name: 'Telegram', username: 'bsj5', url: 'https://t.me/bsj5' },
    { name: 'Email', username: 'matt@peakfemboy.cfd', url: 'mailto:matt@peakfemboy.cfd' },
  ];

  useEffect(() => {
    fetch("https://api.lanyard.rest/v1/users/1040674597235863623")
      .then(res => res.json())
      .then(data => {
        if (data.success) setProfileData(data.data);
      });
  }, []);

  const avatarUrl = profileData 
    ? `https://cdn.discordapp.com/avatars/${profileData.discord_user.id}/${profileData.discord_user.avatar}.png`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const statusColor = profileData ? {
    online: '#43b581',
    idle: '#faa61a',
    dnd: '#f04747',
  }[profileData.discord_status] || '#747f8d' : '#747f8d';

  return (
    <div className="text-white text-center max-w-lg mx-auto">
      <div className="relative w-32 h-32 mx-auto mb-8">
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-full h-full rounded-full object-cover border-2 border-white/10"
        />
        <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-zinc-900"
             style={{ backgroundColor: statusColor }} />
      </div>
      <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Matt
      </h1>
      <p className="mb-8 text-gray-300 text-lg font-light">
        Im Matt. i usually mess with technology and install linux on old PCs
      </p>
      <div className="flex items-center justify-center gap-6 mb-12">
        {socials.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
          >
            {social.name}
          </a>
        ))}
      </div>
    </div>
  );
}

function DiscordActivity() {
  useEffect(() => {
    let previousData = null;

    function getDisocrdStatus() {
      const apiUrl = "https://api.lanyard.rest/v1/users/1040674597235863623";
      fetchData(apiUrl)
        .then((data) => {
          if (JSON.stringify(data) !== JSON.stringify(previousData)) {
            updateDiscordStatus(data);
            previousData = data;
          }
        })
        .catch((error) => console.error("Error:", error));
    }

    async function fetchData(url: string) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching data:", error);
        return null;
      }
    }

    function updateDiscordStatus(data: any) {
      if (!data || !data.success) return;

      const ulElement = document.querySelector(`ul.contacts-list`);
      if (!ulElement) return;

      const existingDiscordItems = ulElement.querySelectorAll('.discord-item');
      const newItems = generateDiscordItems(data);

      existingDiscordItems.forEach(item => {
        if (!newItems.find(newItem => newItem.id === (item as HTMLElement).id)) {
          fadeOutAndRemove(item as HTMLElement);
        }
      });

      newItems.forEach((newItem, index) => {
        const existingItem = ulElement.querySelector(`#${newItem.id}`);
        if (existingItem) {
          updateExistingItem(existingItem as HTMLElement, newItem.html);
        } else {
          addNewItem(ulElement, newItem.html, index);
        }
      });
    }

    getDisocrdStatus();
    const interval = setInterval(getDisocrdStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">Discord Activity</h2>
      <ul className="contacts-list space-y-4"></ul>
    </div>
  );
}

function fadeOutAndRemove(element: HTMLElement) {
  element.style.transition = 'opacity 0.5s, transform 0.5s';
  element.style.opacity = '0';
  element.style.transform = 'translateX(-20px)';
  setTimeout(() => {
    element.remove();
    rearrangeItems();
  }, 500);
}

function updateExistingItem(existingItem: HTMLElement, newHtml: string) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = newHtml;
  const newContent = tempDiv.firstElementChild;

  if (existingItem.innerHTML !== newContent?.innerHTML) {
    existingItem.style.transition = 'opacity 0.3s, transform 0.3s';
    existingItem.style.opacity = '0';
    existingItem.style.transform = 'scale(0.95)';
    setTimeout(() => {
      existingItem.innerHTML = newContent?.innerHTML || '';
      existingItem.style.opacity = '1';
      existingItem.style.transform = 'scale(1)';
    }, 300);
  }
}

function addNewItem(ulElement: HTMLElement, html: string, index: number) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const newItem = tempDiv.firstElementChild as HTMLElement;
  if (!newItem) return;

  newItem.style.opacity = '0';
  newItem.style.transform = 'translateY(-20px)';
  newItem.style.transition = 'opacity 0.5s, transform 0.5s';

  if (index === 0) {
    ulElement.insertBefore(newItem, ulElement.firstChild);
  } else {
    const previousItem = ulElement.querySelector(`.discord-item:nth-child(${index})`);
    if (previousItem) {
      ulElement.insertBefore(newItem, previousItem.nextSibling);
    } else {
      ulElement.appendChild(newItem);
    }
  }

  setTimeout(() => {
    newItem.style.opacity = '1';
    newItem.style.transform = 'translateY(0)';
  }, 50);
}

function rearrangeItems() {
  const ulElement = document.querySelector(`ul.contacts-list`);
  if (!ulElement) return;

  const discordItems = ulElement.querySelectorAll('.discord-item');
  discordItems.forEach((item, index) => {
    (item as HTMLElement).style.transition = 'transform 0.5s';
    (item as HTMLElement).style.transform = `translateY(-${index * 10}px)`;
  });

  setTimeout(() => {
    discordItems.forEach(item => {
      (item as HTMLElement).style.transform = 'translateY(0)';
    });
  }, 50);
}

function generateDiscordItems(data: any) {
  const items = [];
  const { activities } = data.data;

  if (activities) {
    activities.forEach((activity: any) => {
      if (activity.name === "Spotify") {
        const { details: song, state: artist, assets, sync_id } = activity;
        const album_art_url = assets.large_image.startsWith('spotify:')
          ? `https://i.scdn.co/image/${assets.large_image.slice(8)}`
          : assets.large_image;

        items.push({
          id: 'discord-activity-spotify',
          html: `
            <li id="discord-activity-spotify" class="contact-item discord-item">
              <div class="icon-box">
                <img src="${album_art_url}" alt="Spotify" class="w-12 h-12 rounded-lg">
              </div>
              <div class="contact-info">
                <p class="contact-title">Spotify</p>
                <p class="contact-link" style="max-width:150px; cursor: pointer;" onclick="window.open('https://open.spotify.com/track/${sync_id}', '_blank')">${song}</p>
                <p class="contact-title" style="cursor: pointer;" onclick="window.open('https://open.spotify.com/search/${encodeURIComponent(artist)}', '_blank')">${artist}</p>
              </div>
            </li>`
        });
      }
    });
  }

  return items;
}

export default function Home() {
  return (
    <main className="min-h-screen relative bg-zinc-900 flex items-center justify-center cursor-none">
      <CustomCursor />
      <GridBackground />
      <div className="container px-4 py-16 relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-3xl mx-auto backdrop-blur-sm rounded-2xl p-12 bg-black/20 border border-white/5 shadow-2xl">
          <Profile />
          <DiscordActivity />
        </div>
      </div>
    </main>
  );
}
