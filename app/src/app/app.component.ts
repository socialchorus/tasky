import { Component, ChangeDetectionStrategy } from "@angular/core";
import { ElasticsearchService } from "./services/elasticsearch.service";
import { filter } from "rxjs/operators";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  isCollapsed = false;
  currentHostName: string;

  constructor(private es: ElasticsearchService) {
    this.es
      .hostChanged()
      .pipe(filter(Boolean))
      .subscribe(({ host }) => {
        this.currentHostName = host;
      });
  }
}
