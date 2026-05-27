(function(){
    var BASE = '/LMCSByeLaws/';
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
                { label: 'Reports', href: 'employee-code-of-conduct/reports/index.html' },
                { label: 'Inventory & Infrastructure', href: 'employee-code-of-conduct/inventory-infrastructure/index.html' },
                { label: 'Transport & Logistics', href: 'employee-code-of-conduct/transport-logistics/index.html' },
                { label: 'School Rules', href: 'employee-code-of-conduct/school-rules/index.html' },
                { label: 'Academics & Examination', href: 'employee-code-of-conduct/academics-examination/index.html' }
                      ]
      },
      {
              label: 'Administrative',
              href: 'administrative-code-of-conduct/index.html',
              children: []
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
         var html = '<div class="section-label">Navigation</div><ul class="lmcs-nav">';
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

   iif (document.readyState === 'loading'){
         document.addEventListener('DOMContentLoaded', build);
   } else {
         build();
   }
})();
