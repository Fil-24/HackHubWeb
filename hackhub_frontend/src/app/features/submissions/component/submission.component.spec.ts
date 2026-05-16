import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmissionComponent } from './submission.component';
import { provideRouter } from '@angular/router'; 
import { provideHttpClient } from '@angular/common/http'; 
import { provideHttpClientTesting } from '@angular/common/http/testing'; 

describe('SubmissionComponent', () => {
  let component: SubmissionComponent;
  let fixture: ComponentFixture<SubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionComponent],
      providers: [
        provideRouter([]),             
        provideHttpClient(),           
        provideHttpClientTesting()     
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmissionComponent);
    component = fixture.componentInstance;
    
    
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});