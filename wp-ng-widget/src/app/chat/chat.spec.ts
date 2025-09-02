import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyWidget } from './chat.component';

describe('MyWidget', () => {
  let component: MyWidget;
  let fixture: ComponentFixture<MyWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
