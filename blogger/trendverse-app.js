/* TRENDVERSE Blogger Theme Vanilla JavaScript
   - Mobile Navigation Drawer (click, Escape, outside click)
   - Featured Cover Deduplication
   - Automatic Article Table of Contents
   - Related Posts via Blogger JSON-in-Script Feed (Normalized URLs, Zero API Key)
   - Copy-to-Clipboard & Social Share Helpers

   External Hosting Option (GitHub + jsDelivr):
   https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USER/trendverse@main/blogger/trendverse-app.js
*/
(function () {
  'use strict';

  function normalizeBloggerUrl(url) {
    return String(url || '')
      .replace(/^https?:\/\//i, '')
      .replace(/[?#].*$/, '')
      .replace(/\/+$/, '');
  }

  // 0. Live Digital World Clock (Homepage Bar)
  var liveDateEl = document.getElementById('tv-live-date');
  var liveClocksEl = document.getElementById('tv-live-clocks');
  if (liveDateEl && liveClocksEl) {
    var updateClocks = function () {
      var now = new Date();
      liveDateEl.textContent = now.toUTCString().replace('GMT', 'UTC');
      var zones = [
        ['NYC', 'America/New_York'],
        ['LON', 'Europe/London'],
        ['DEL', 'Asia/Kolkata'],
        ['TYO', 'Asia/Tokyo'],
      ];
      liveClocksEl.textContent = '';
      zones.forEach(function (z) {
        var span = document.createElement('span');
        try {
          var t = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: z[1],
          });
          span.textContent = z[0] + ': ' + t;
        } catch (_e) {
          span.textContent = z[0];
        }
        liveClocksEl.appendChild(span);
      });
    };
    updateClocks();
    setInterval(updateClocks, 60000);
  }

  // 1. Mobile Navigation Toggle
  var menuBtn = document.getElementById('tv-menu-toggle');
  var navEl = document.getElementById('tv-primary-nav');
  if (menuBtn && navEl) {
    menuBtn.addEventListener('click', function () {
      var expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!expanded));
      navEl.classList.toggle('is-open');
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navEl.classList.contains('is-open')) {
        navEl.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('click', function (event) {
      if (
        navEl.classList.contains('is-open') &&
        !navEl.contains(event.target) &&
        !menuBtn.contains(event.target)
      ) {
        navEl.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. Deduplicate Featured Cover if Post Body Starts With Same Image
  var articleCover = document.getElementById('tv-article-cover');
  var articleBody = document.getElementById('tv-article-body');
  if (articleCover && articleBody) {
    var coverImg = articleCover.querySelector('img');
    var firstBodyImg = articleBody.querySelector('img');
    if (
      coverImg &&
      firstBodyImg &&
      normalizeBloggerUrl(coverImg.src) === normalizeBloggerUrl(firstBodyImg.src)
    ) {
      articleCover.style.display = 'none';
    }
  }

  // 3. Automatic Table of Contents on Post Pages
  var tocList = document.getElementById('tv-toc-list');
  var tocBox = document.getElementById('tv-toc-box');
  if (articleBody && tocList && tocBox) {
    var headings = articleBody.querySelectorAll('h2, h3');
    if (headings.length > 0) {
      tocBox.hidden = false;
      headings.forEach(function (heading, index) {
        if (!heading.id) {
          heading.id = 'section-' + (index + 1);
        }
        var li = document.createElement('li');
        var link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;
        li.appendChild(link);
        tocList.appendChild(li);
      });
    }
  }

  // 4. Related Posts via Blogger Label Feed (JSONP, Zero API Key)
  var relatedBox = document.getElementById('tv-related-posts');
  if (relatedBox) {
    var label = relatedBox.getAttribute('data-label');
    var currentUrlNorm = normalizeBloggerUrl(
      relatedBox.getAttribute('data-current-url') || window.location.href
    );
    if (label) {
      window.tvRenderRelated = function (data) {
        var entries = (data && data.feed && data.feed.entry) || [];
        var list = document.getElementById('tv-related-list');
        if (!list) return;
        var count = 0;
        entries.forEach(function (entry) {
          if (count >= 4) return;
          var href = '';
          (entry.link || []).forEach(function (l) {
            if (l.rel === 'alternate') href = l.href;
          });
          if (!href || normalizeBloggerUrl(href) === currentUrlNorm) return;
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = href;
          a.textContent = (entry.title && entry.title.$t) || 'Related Story';
          li.appendChild(a);
          list.appendChild(li);
          count += 1;
        });
        if (count > 0) relatedBox.hidden = false;
      };
      var script = document.createElement('script');
      script.src =
        '/feeds/posts/default/-/' +
        encodeURIComponent(label) +
        '?alt=json-in-script&callback=tvRenderRelated&max-results=6';
      script.async = true;
      script.onerror = function () {
        relatedBox.hidden = true;
      };
      document.body.appendChild(script);
    }
  }

  // 5. Copy Article Link Button & Share Intents
  var copyBtn = document.getElementById('tv-copy-link');
  if (copyBtn && navigator.clipboard && navigator.clipboard.writeText) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(function () {
        copyBtn.textContent = 'Link Copied';
        setTimeout(function () {
          copyBtn.textContent = 'Copy Link';
        }, 2000);
      });
    });
  }

  var pageUrl = encodeURIComponent(window.location.href);
  var pageTitle = encodeURIComponent(document.title);
  var shareX = document.getElementById('tv-share-x');
  var shareLi = document.getElementById('tv-share-linkedin');
  var shareWa = document.getElementById('tv-share-whatsapp');
  if (shareX) shareX.href = 'https://twitter.com/intent/tweet?url=' + pageUrl + '&text=' + pageTitle;
  if (shareLi) shareLi.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + pageUrl;
  if (shareWa) shareWa.href = 'https://api.whatsapp.com/send?text=' + pageTitle + '%20' + pageUrl;
})();
