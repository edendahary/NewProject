import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { sidebarData } from './sidebar-data';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
interface SideNavToggle{
  screenWidth: number;
  collapsed: boolean;

}
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations:[
    trigger('fadeInOut',[
      transition(':enter',[
        style({opacity:0}),
        animate('350ms',
          style({opacity:1})
        )
      ]),
      transition(':leave',[
        style({opacity:1}),
        animate('350ms',
          style({opacity:0})
        )
      ])
    ]),
        trigger('rotate',[
          transition(':enter',[
            animate('1000ms',
            keyframes([
              style({transform: 'rotate(0deg)',offset:'0'}),
              style({transform: 'rotate(2turn)',offset:'1'})

            ]))

          ])
        ])
  ]
})
export class SidebarComponent implements OnInit{
  ngOnInit(): void {
    this.screenWidth = window.innerWidth;

    }
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  screenWidth = 0;
  collapsed = false;
  navData = sidebarData

  @HostListener('window:resize', ['$event'])
  onResize(event: any){
    this.screenWidth = window.innerWidth;
    if(this.screenWidth <= 768){
      this.collapsed = false;
      this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});

    }
  }

  
toggleCollapse(): void{
  this.collapsed = !this.collapsed;
  this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
}
colseSidenav(): void{
  this.collapsed = false;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});

}

}
