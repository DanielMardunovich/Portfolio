import "./index.css";

import Arena from "./Arena";
import Enemy from "./Enemy";
import Party from "./Party";
import UI from "./UI";

export default function App() {
    return (
        <div className="screen">

            <div className="battlefield">
                <Arena type="Forest">

                    <div className="enemies">
                        <Enemy
                            icon="/Icons/linkedinpixel.png"
                            link="https://www.linkedin.com/in/daniel-mardunovich/"
                            className="LinkedIn"
                        />
                        <Enemy
                            icon="/Icons/Self.png"
                            link="https://danielmardunovich.github.io/Portfolio/"
                            className="Self"
                        />
                        <Enemy
                            icon="/Icons/githubpixel.png"
                            link="https://github.com/DanielMardunovich"
                            className="GitHub"
                        />
                    </div>

                    <Party />

                </Arena>
            </div>

            <UI />

        </div>
    );
}
