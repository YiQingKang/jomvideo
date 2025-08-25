import React from 'react';
import { Dropdown, Menu, Button, message } from 'antd';
import { ShareAltOutlined, TikTokOutlined, InstagramOutlined, FacebookOutlined, WhatsAppOutlined, LinkOutlined } from '@ant-design/icons';

const ShareMenu = ({ video }) => {

  const handleShare = (platform) => {
    const shareUrl = `${window.location.origin}/videos/${video.id}`;

    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      message.success('Video URL copied to clipboard!');
      return;
    }

    let platformShareUrl;
    switch (platform) {
      case 'facebook':
        platformShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&t=${encodeURIComponent("Check out this video")}`;
        break;
      case 'whatsapp':
        platformShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this video: ${shareUrl}`)}`;
        break;
      default:
        navigator.clipboard.writeText(shareUrl);
        message.info(`Sharing to ${platform} is not directly supported. The video URL has been copied to your clipboard.`);
        return;
    }
    window.open(platformShareUrl, '_blank');
  };

  const menu = (
    <Menu>
      <Menu.Item key="copy" icon={<LinkOutlined />} onClick={() => handleShare('copy')}>
        Copy URL
      </Menu.Item>
      <Menu.Item key="whatsapp" icon={<WhatsAppOutlined />} onClick={() => handleShare('whatsapp')}>
        WhatsApp
      </Menu.Item>
      <Menu.Item key="facebook" icon={<FacebookOutlined />} onClick={() => handleShare('facebook')}>
        Facebook
      </Menu.Item>
      {/* <Menu.Item key="tiktok" icon={<TikTokOutlined />} onClick={() => handleShare('TikTok')}>
        TikTok
      </Menu.Item>
      <Menu.Item key="instagram" icon={<InstagramOutlined />} onClick={() => handleShare('Instagram')}>
        Instagram
      </Menu.Item> */}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button type="text" icon={<ShareAltOutlined />} disabled={video.status !== 'completed'}>
        Share
      </Button>
    </Dropdown>
  );
};

export default ShareMenu;
