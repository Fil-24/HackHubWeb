import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyHackathonComponent } from './my-hackathon.component';

describe('MyHackathonComponent', () => {
  let component: MyHackathonComponent;
  let fixture: ComponentFixture<MyHackathonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyHackathonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyHackathonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
