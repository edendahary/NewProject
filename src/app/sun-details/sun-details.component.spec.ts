import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SunDetailsComponent } from './sun-details.component';

describe('SunDetailsComponent', () => {
  let component: SunDetailsComponent;
  let fixture: ComponentFixture<SunDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SunDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SunDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
