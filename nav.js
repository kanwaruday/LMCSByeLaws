(function(){
    var BASE = (function(){
     var p = window.location.pathname;
     return p.indexOf('/LMCSByeLaws/') >= 0 ? '/LMCSByeLaws/' : '/';
   })();
    var sections = [
      { label: 'Home', href: 'index.html' },
      { label: 'Abbreviations', href: 'abbreviations.html' },
      { label: 'Vision & Mission', href: 'vision-mission.html' },
      {
              label: 'Student Code of Conduct',
              href: 'student-code-of-conduct/index.html',
              children: [
                { label: 'Starting at LMS', href: 'student-code-of-conduct/starting-at-lms/index.html' },
                { label: 'Transport, Attendance & Timing', href: 'student-code-of-conduct/transport-attendance-timing/index.html' },
                { label: 'Fees & Administrative Procedures', href: 'student-code-of-conduct/fees-administrative-procedures/index.html' },
                { label: 'Behaviour & Student Culture', href: 'student-code-of-conduct/behaviour-student-culture/index.html' },
                { label: 'Tips for Academic Life', href: 'student-code-of-conduct/tips-successful-academic-life/index.html' },
                { label: 'FAQ', href: 'student-code-of-conduct/faq.html' }
                      ]
      },
      {
              label: 'Employee Code of Conduct',
              href: 'employee-code-of-conduct/index.html',
              children: [
                { label: 'Appointments & HR', href: 'employee-code-of-conduct/appointments-hr/index.html' },
                { label: 'Service Rules, Leaves & Job Roles', href: 'employee-code-of-conduct/service-rules-leaves-job-roles/index.html' },
                { label: 'School Staff', href: 'employee-code-of-conduct/school-staff/index.html' },
                { label: 'Reports', href: 'employee-code-of-conduct/reports/index.html' },
                { label: 'Inventory & Infrastructure', href: 'employee-code-of-conduct/inventory-infrastructure/index.html' },
                { label: 'Transport & Logistics', href: 'employee-code-of-conduct/transport-logistics/index.html' },
                { label: 'School Rules', href: 'employee-code-of-conduct/school-rules/index.html' },
                { label: 'Academics & Examination', href: 'employee-code-of-conduct/academics-examination/index.html' },
                { label: 'School Events', href: 'employee-code-of-conduct/school-events/index.html' },
                { label: 'Systems, IT & Technology', href: 'employee-code-of-conduct/systems-it-technology/index.html' },
                { label: 'Archived', href: 'employee-code-of-conduct/archived/index.html' }
                      ]
      },
      {
              label: 'Administrative',
              href: 'administrative-code-of-conduct/index.html',
              children: [
                { label: 'Admin Reports', href: 'administrative-code-of-conduct/admin-reports/index.html' },
                { label: 'School Processes', href: 'administrative-code-of-conduct/school-processes/index.html' },
                { label: 'Past Fee Structures', href: 'administrative-code-of-conduct/past-fees-structures/index.html' },
                { label: 'Archived Decisions', href: 'administrative-code-of-conduct/archived-decisions/index.html' }
              ]
      }
        ];

   function currentPath(){
         var p = window.location.pathname;
         var idx = p.indexOf(BASE);
         if (idx >= 0) p = p.substring(idx + BASE.length);
         if (p === '' || p.endsWith('/')) p += 'index.html';
         return p;
   }

   function isActive(href, cur){
         return href === cur;
   }

   function sectionContainsCurrent(sec, cur){
         if (isActive(sec.href, cur)) return true;
         if (sec.children){
                 for (var i=0;i<sec.children.length;i++){
                           if (cur.indexOf(sec.children[i].href.replace(/index\.html$/,'')) === 0) return true;
                           if (isActive(sec.children[i].href, cur)) return true;
                 }
         }
         var prefix = sec.href.replace(/index\.html$/,'');
         if (prefix && cur.indexOf(prefix) === 0) return true;
         return false;
   }

   function build(){
         var nav = document.querySelector('nav.sidebar');
         if (!nav) return;
         var cur = currentPath();

         // Search form — prepopulate when on the search page
         var searchQ = '';
         if (cur === 'search.html') {
           searchQ = new URLSearchParams(window.location.search).get('q') || '';
         }
         var html = '<form class="nav-search-form" action="' + BASE + 'search.html" method="get" autocomplete="off">'
           + '<div class="nav-search-wrap">'
           + '<input type="search" name="q" class="nav-search-input" placeholder="Search…" value="' + searchQ.replace(/"/g,'&quot;') + '" spellcheck="false" aria-label="Search">'
           + '<button type="submit" class="nav-search-btn" aria-label="Go">&#9906;</button>'
           + '</div></form>';

         html += '<div class="section-label">Navigation</div><ul class="lmcs-nav">';
         sections.forEach(function(sec){
                 var hasChildren = sec.children && sec.children.length > 0;
                 var open = sectionContainsCurrent(sec, cur);
                 var activeCls = isActive(sec.href, cur) ? ' active' : '';
                 if (hasChildren){
                           html += '<li class="nav-group' + (open ? ' open' : '') + '">';
                           html += '<div class="nav-group-header"><a href="' + BASE + sec.href + '" class="nav-link' + activeCls + '">' + sec.label + '</a>';
                           html += '<button class="nav-toggle" aria-label="Toggle" type="button">' + (open ? '\u25BE' : '\u25B8') + '</button></div>';
                           html += '<ul class="nav-children">';
                           sec.children.forEach(function(ch){
                                       var chActive = isActive(ch.href, cur) ? ' active' : '';
                                       html += '<li><a href="' + BASE + ch.href + '" class="nav-link' + chActive + '">' + ch.label + '</a></li>';
                           });
                           html += '</ul></li>';
                 } else {
                           html += '<li><a href="' + BASE + sec.href + '" class="nav-link' + activeCls + '">' + sec.label + '</a></li>';
                 }
         });
         html += '</ul>';
         nav.innerHTML = html;

      nav.querySelectorAll('.nav-toggle').forEach(function(btn){
              btn.addEventListener('click', function(e){
                        e.preventDefault();
                        var group = btn.closest('.nav-group');
                        var isOpen = group.classList.toggle('open');
                        btn.textContent = isOpen ? '\u25BE' : '\u25B8';
              });
      });
   }

   // Press "/" to focus the sidebar search input
   function setupSearchShortcut(){
         document.addEventListener('keydown', function(e){
                 if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
                 var tag = (document.activeElement || {}).tagName || '';
                 if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
                 var inp = document.querySelector('.nav-search-input');
                 if (!inp) return;
                 e.preventDefault();
                 inp.focus();
                 inp.select();
         });
   }

   if (document.readyState === 'loading'){
         document.addEventListener('DOMContentLoaded', function(){ build(); setupSearchShortcut(); });
   } else {
         build();
         setupSearchShortcut();
   }
})();
